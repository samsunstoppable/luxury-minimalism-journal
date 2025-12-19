import modal
import os
from fastapi import Request

app = modal.App("journal-agent")

image = (
    modal.Image.debian_slim()
    .pip_install("openai", "anthropic", "python-dotenv")
)

@app.function(image=image, secrets=[modal.Secret.from_name("openai-secret"), modal.Secret.from_name("anthropic-secret")])
def transcribe_audio_internal(audio_url: str):
    from openai import OpenAI
    import urllib.request
    
    # Download the audio file
    file_name = "/tmp/audio.webm"
    urllib.request.urlretrieve(audio_url, file_name)
    
    client = OpenAI()
    
    with open(file_name, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            model="whisper-1", 
            file=audio_file
        )
    
    return transcription.text

@app.function(image=image, secrets=[modal.Secret.from_name("anthropic-secret")], timeout=600)
def run_analysis_internal(entries: list, transcript: str, persona: str):
    import anthropic
    
    client = anthropic.Anthropic()
    
    # Construct the context
    entries_text = "\n\n".join([f"Date: {e['date']}\nContent: {e['content']}" for e in entries])
    
    system_prompt = f"""
    You are {persona}. 
    You are a world-class psychoanalyst and philosopher.
    Your goal is to read the user's journal entries and their self-reflection interview, 
    and provide a "Drastic Diagnosis" - a deep, penetrating analysis of their subconscious patterns, 
    limiting beliefs, and hidden strengths.
    
    Be direct, profound, and transformative. Use the voice and style of {persona}.
    """
    
    user_message = f"""
    Here are my journal entries from the last 7 days:
    
    {entries_text}
    
    And here is the transcript of my deep-dive interview:
    
    {transcript}
    
    Analyze me.
    """
    
    message = client.messages.create(
        model="claude-3-5-sonnet-20240620",
        max_tokens=4096,
        temperature=0.7,
        system=system_prompt,
        messages=[
            {"role": "user", "content": user_message}
        ]
    )
    
    return message.content[0].text

@app.function()
@modal.web_endpoint(method="POST")
async def api_transcribe(request: Request):
    data = await request.json()
    result = transcribe_audio_internal.remote(data["audio_url"])
    return {"text": result}

@app.function()
@modal.web_endpoint(method="POST")
async def api_analyze(request: Request):
    data = await request.json()
    result = run_analysis_internal.remote(data["entries"], data["transcript"], data["persona"])
    return {"analysis": result}
