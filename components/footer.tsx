import Link from "next/link"

export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border bg-background">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center md:text-left">
          <p className="font-serif text-sm text-foreground">
            Journal — Where Self-Knowledge Begins
          </p>
          <p className="font-sans text-[10px] text-muted-foreground uppercase tracking-widest">
            A luxury experience for those who seek depth.
          </p>
        </div>
        
        <nav className="flex items-center gap-6">
          <Link href="/terms" className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            Privacy
          </Link>
          <a href="mailto:support@journal.app" className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </a>
        </nav>

        <p className="font-sans text-[10px] text-muted-foreground/50">
          &copy; {new Date().getFullYear()} Journal.
        </p>
      </div>
    </footer>
  )
}
