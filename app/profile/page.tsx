"use client"

import { useState } from "react"
import { useQuery, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import Link from "next/link"
import { ArrowLeft, User, Sparkles, MessageSquare, Settings, Crown, Check, LogOut } from "lucide-react"
import { isPremiumUser, SUBSCRIPTION_PRICE } from "@/lib/subscription"
import { useClerk } from "@clerk/nextjs"

export default function ProfilePage() {
  const user = useQuery(api.users.get);
  const sessions = useQuery(api.sessions.list);
  const createCheckout = useAction(api.polar.createCheckout);
  const { signOut } = useClerk();
  const [isLoading, setIsLoading] = useState(false);

  const hasPremium = isPremiumUser(user?.subscriptionStatus);

  const handleSignOut = () => {
    signOut({ redirectUrl: "/" });
  };

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const { url } = await createCheckout({});
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Derive initials
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??"

  return (
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-foreground/10">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-3xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
            <Link href="/" className="p-2 -ml-2 hover:opacity-60 transition-opacity">
                <ArrowLeft size={20} />
            </Link>
            <h1 className="font-serif text-lg tracking-widest">Profile</h1>
            <div className="w-8" /> {/* Spacer for centering */}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20 space-y-12">
        
        {/* User Card */}
        <section className="flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-foreground/5 flex items-center justify-center mb-2">
                <span className="font-serif text-3xl tracking-widest text-foreground/80">{initials}</span>
            </div>
            <div>
                <h2 className="font-serif text-2xl">{user?.name || "Guest"}</h2>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
            </div>
            {hasPremium ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-xs tracking-wider uppercase">
                <Crown size={12} />
                Premium Member
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs tracking-wider uppercase text-muted-foreground">
                <User size={12} />
                Free Plan
              </div>
            )}
        </section>

        {/* Upgrade CTA for Free Users */}
        {!hasPremium && (
          <section className="bg-foreground text-background p-6 md:p-8 rounded-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <h3 className="font-serif text-xl">Unlock Your Guides</h3>
                <p className="font-sans text-sm text-background/70 max-w-md">
                  Access ten legendary minds. Voice sessions. AI-powered analysis. All for {SUBSCRIPTION_PRICE}/month.
                </p>
              </div>
              <button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="flex-shrink-0 px-8 py-3 bg-background text-foreground font-sans text-sm tracking-widest uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Upgrade Now"}
              </button>
            </div>
            <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-background/20">
              <span className="flex items-center gap-1.5 text-xs text-background/70">
                <Check size={12} /> All 10 guides
              </span>
              <span className="flex items-center gap-1.5 text-xs text-background/70">
                <Check size={12} /> Voice sessions
              </span>
              <span className="flex items-center gap-1.5 text-xs text-background/70">
                <Check size={12} /> AI analysis
              </span>
              <span className="flex items-center gap-1.5 text-xs text-background/70">
                <Check size={12} /> Unlimited chats
              </span>
            </div>
          </section>
        )}

        {/* AI Summary Card */}
        <section className="space-y-6">
            <div className="flex items-center gap-2 text-foreground/80">
                <Sparkles size={18} />
                <h3 className="font-serif text-lg tracking-wide">Your Digital Self</h3>
            </div>
            <div className="bg-card border border-border p-6 md:p-8 rounded-sm shadow-sm">
                {user?.summary ? (
                    <div className="prose prose-sm prose-p:text-muted-foreground prose-p:leading-relaxed font-serif">
                        {user.summary.split('\n').map((para, i) => (
                             <p key={i} className="mb-4 last:mb-0">{para}</p>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground italic">
                        <p>Complete your first voice session to generate your profile.</p>
                    </div>
                )}
            </div>
             <p className="text-xs text-muted-foreground text-center max-w-lg mx-auto leading-relaxed">
                This summary is privately generated by your AI companion based on your journals and conversations. 
                It helps tailor future interactions to your unique psychology.
            </p>
        </section>

        {/* Conversation History */}
        <section className="space-y-6">
            <div className="flex items-center gap-2 text-foreground/80">
                <MessageSquare size={18} />
                <h3 className="font-serif text-lg tracking-wide">Conversation History</h3>
            </div>
            <div className="space-y-px bg-border border border-border rounded-sm overflow-hidden">
                {sessions === undefined ? (
                    <div className="p-8 text-center text-muted-foreground">Loading...</div>
                ) : sessions.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No conversations yet.</div>
                ) : (
                    sessions.map((session) => (
                        <div key={session._id} className="bg-card p-4 md:p-6 flex items-center justify-between hover:bg-foreground/5 transition-colors group">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <span className="font-serif text-lg capitalize">{session.personaId}</span>
                                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                        session.status === 'completed' ? 'border-green-200 text-green-700' : 'border-amber-200 text-amber-700'
                                    }`}>
                                        {session.status}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(session.startedAt).toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "numeric",
                                        minute: "numeric"
                                    })}
                                </p>
                            </div>
                            {/* Potential Action: View Detail / Transcript? 
                                For now, just static history. 
                            */}
                        </div>
                    ))
                )}
            </div>
        </section>

        {/* Settings Placeholder */}
        <section className="space-y-6 opacity-50 pointer-events-none filter blur-[1px]">
            <div className="flex items-center gap-2 text-foreground/80">
                <Settings size={18} />
                <h3 className="font-serif text-lg tracking-wide">Settings</h3>
            </div>
            <div className="bg-card border border-border p-6 rounded-sm space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="font-sans text-sm">Dark Mode</span>
                    <div className="w-10 h-6 bg-border rounded-full relative"><div className="w-4 h-4 bg-background rounded-full absolute top-1 left-1"/></div>
                 </div>
                 <div className="h-px bg-border/50" />
                 <div className="flex justify-between items-center">
                    <span className="font-sans text-sm">Notifications</span>
                    <div className="w-10 h-6 bg-foreground rounded-full relative"><div className="w-4 h-4 bg-background rounded-full absolute top-1 right-1"/></div>
                 </div>
            </div>
        </section>

        {/* Sign Out */}
        <section className="pt-6 border-t border-border">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full p-4 -mx-4 text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors rounded-sm"
          >
            <LogOut size={18} />
            <span className="font-sans text-sm">Sign Out</span>
          </button>
        </section>

      </div>
    </main>
  )
}
