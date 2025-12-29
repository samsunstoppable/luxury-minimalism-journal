import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-foreground/10 px-6 py-12 md:py-24">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={20} />
          <span>Back</span>
        </Link>
        
        <header className="space-y-4">
          <h1 className="font-serif text-3xl md:text-5xl tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest">Last Updated: December 28, 2025</p>
        </header>

        <section className="prose prose-sm md:prose-base prose-headings:font-serif prose-headings:font-normal prose-p:text-muted-foreground prose-p:leading-relaxed font-serif space-y-8">
          <div>
            <h2 className="text-xl md:text-2xl text-foreground mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using this application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl text-foreground mb-4">2. Description of Service</h2>
            <p>
              We provide an AI-powered journaling and reflection platform. The service includes text and voice journaling, AI analysis of entries, and interactive chat with AI personas.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl text-foreground mb-4">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must be at least 18 years old to use this service.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl text-foreground mb-4">4. Intellectual Property</h2>
            <p>
              You retain all rights to the content you write or record in your journal. We claim no ownership over your personal reflections. The application's design, code, and AI models are the property of the application owners.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl text-foreground mb-4">5. Privacy</h2>
            <p>
              Your use of the service is also governed by our Privacy Policy. We use advanced AI to analyze your data to provide insights, but we do not sell your personal journal data to third parties.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl text-foreground mb-4">6. Limitation of Liability</h2>
            <p>
              The AI insights provided are for personal reflection only and do not constitute professional psychological, medical, or legal advice. Use the service at your own risk.
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
