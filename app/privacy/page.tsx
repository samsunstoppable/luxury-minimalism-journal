import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-foreground/10 px-6 py-12 md:py-24">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={20} />
          <span>Back</span>
        </Link>
        
        <header className="space-y-4">
          <h1 className="font-serif text-3xl md:text-5xl tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest">Last Updated: December 28, 2025</p>
        </header>

        <section className="prose prose-sm md:prose-base prose-headings:font-serif prose-headings:font-normal prose-p:text-muted-foreground prose-p:leading-relaxed font-serif space-y-8">
          <div>
            <h2 className="text-xl md:text-2xl text-foreground mb-4">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Account information (name, email) via Clerk.</li>
              <li>Journal entries (text and audio recordings).</li>
              <li>Chat history with AI personas.</li>
              <li>Payment information via Polar/Stripe (we do not store credit card details).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl text-foreground mb-4">2. How We Use Your Information</h2>
            <p>
              We use your information to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Provide, maintain, and improve our services.</li>
              <li>Generate AI-powered insights and reflections tailored to your psychology.</li>
              <li>Process your transactions and send related information.</li>
              <li>Communicate with you about products, services, and events.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl text-foreground mb-4">3. Data Sharing</h2>
            <p>
              We share your data with AI providers (OpenAI, OpenRouter) solely for the purpose of generating reflections and analysis. These providers are not permitted to use your data for training their general models. We do not sell your personal data.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl text-foreground mb-4">4. Your Rights (GDPR/CCPA)</h2>
            <p>
              You have the right to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Access and export your personal data.</li>
              <li>Request the deletion of your account and all associated data.</li>
              <li>Correct any inaccurate personal information.</li>
            </ul>
            <p className="mt-4">
              These features are available directly in your Profile settings.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl text-foreground mb-4">5. Security</h2>
            <p>
              We use industry-standard security measures to protect your data. Your journal entries are private to your account and are not accessible to other users.
            </p>
          </div>
        </section>
        
        <footer className="pt-12 border-t border-border">
          <p className="text-xs text-muted-foreground font-sans">
            &copy; 2025 Journal. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}
