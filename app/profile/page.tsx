"use client"

import { useState } from "react"
import { useQuery, useAction, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import Link from "next/link"
import { ArrowLeft, User, Sparkles, MessageSquare, Settings, Crown, Check, LogOut, Download, Trash2, ShieldCheck, ExternalLink } from "lucide-react"
import { isPremiumUser, SUBSCRIPTION_PRICE } from "@/lib/subscription"
import { useClerk } from "@clerk/nextjs"
import { toast } from "sonner"
import { Footer } from "@/components/footer"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnalysisChat } from "@/components/analysis-chat"
import type { Persona } from "@/components/persona-card"
import type { Id } from "@/convex/_generated/dataModel"

const PERSONAS = [
  { id: "jung", name: "Carl Jung", subtitle: "The Shadow Analyst", imageQuery: "" },
  { id: "jesus", name: "Jesus", subtitle: "The Compassionate Healer", imageQuery: "" },
  { id: "nietzsche", name: "Friedrich Nietzsche", subtitle: "The Will to Power", imageQuery: "" },
  { id: "seneca", name: "Seneca", subtitle: "The Stoic Sage", imageQuery: "" },
  { id: "buddha", name: "Buddha", subtitle: "The Enlightened One", imageQuery: "" },
  { id: "socrates", name: "Socrates", subtitle: "The Questioner", imageQuery: "" },
  { id: "aurelius", name: "Marcus Aurelius", subtitle: "The Philosopher King", imageQuery: "" },
  { id: "lao-tzu", name: "Lao Tzu", subtitle: "The Taoist Master", imageQuery: "" },
  { id: "rumi", name: "Rumi", subtitle: "The Mystic Poet", imageQuery: "" },
  { id: "freud", name: "Sigmund Freud", subtitle: "The Dream Interpreter", imageQuery: "" },
]

export default function ProfilePage() {
  const user = useQuery(api.users.get);
  const sessions = useQuery(api.sessions.list);
  const createCheckout = useAction(api.polar.createCheckout);
  const exportData = useAction(api.users.exportData);
  const deleteAccount = useMutation(api.users.deleteAccount);
  const updatePersona = useMutation(api.users.updateDefaultPersona);
  const updateNotifications = useMutation(api.users.updateNotificationSettings);
  const { signOut } = useClerk();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeSession, setActiveSession] = useState<{ id: Id<"sessions">, persona: Persona } | null>(null);

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
      toast.error("Failed to start checkout.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `journal-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data export started.");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you absolutely sure? This will permanently delete your account and all your journal entries. This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success("Account deleted successfully.");
      signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete account.");
      setIsDeleting(false);
    }
  };

  // Derive initials
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
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
            {user === undefined ? (
              <>
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48 mx-auto" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                </div>
              </>
            ) : (
              <>
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
              </>
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
                        {user.summary.split('\n').map((para: string, i: number) => (
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
                    <div className="bg-card p-6 space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No conversations yet.</div>
                ) : (
                    sessions.map((session: any) => (
                        <button 
                            key={session._id} 
                            onClick={() => {
                                const persona = PERSONAS.find(p => p.id === session.personaId) || PERSONAS[0];
                                setActiveSession({ id: session._id, persona });
                            }}
                            className="w-full text-left bg-card p-4 md:p-6 flex items-center justify-between hover:bg-foreground/5 transition-colors group"
                        >
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
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MessageSquare size={16} className="text-muted-foreground" />
                            </div>
                        </button>
                    ))
                )}
            </div>

            {activeSession && (
                <AnalysisChat 
                    persona={activeSession.persona} 
                    sessionId={activeSession.id} 
                    onClose={() => setActiveSession(null)} 
                />
            )}
        </section>

        {/* Settings */}
        <section className="space-y-6">
            <div className="flex items-center gap-2 text-foreground/80">
                <Settings size={18} />
                <h3 className="font-serif text-lg tracking-wide">Settings</h3>
            </div>
            <div className="bg-card border border-border p-6 rounded-sm space-y-6">
                 <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <p className="font-sans text-sm font-medium">Dark Mode</p>
                        <p className="font-sans text-xs text-muted-foreground">Adjust the interface to your preference.</p>
                    </div>
                    <Switch 
                        checked={theme === 'dark'} 
                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
                    />
                 </div>
                 
                 <div className="h-px bg-border/50" />
                 
                 <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <p className="font-sans text-sm font-medium">Email Notifications</p>
                        <p className="font-sans text-xs text-muted-foreground">Receive daily reminders and cycle updates.</p>
                    </div>
                    <Switch 
                        checked={user?.notificationsEnabled ?? true} 
                        onCheckedChange={(checked) => updateNotifications({ enabled: checked })} 
                    />
                 </div>

                 <div className="h-px bg-border/50" />

                 <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <p className="font-sans text-sm font-medium">Default Mentor</p>
                        <p className="font-sans text-xs text-muted-foreground">Your preferred guide for daily reflections.</p>
                    </div>
                    <Select 
                        value={user?.defaultPersonaId || "jung"} 
                        onValueChange={(value) => updatePersona({ personaId: value })}
                    >
                        <SelectTrigger className="w-[180px] bg-background">
                            <SelectValue placeholder="Select a mentor" />
                        </SelectTrigger>
                        <SelectContent>
                            {PERSONAS.map((p) => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>

                 {hasPremium && (
                    <>
                        <div className="h-px bg-border/50" />
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <p className="font-sans text-sm font-medium">Subscription</p>
                                <p className="font-sans text-xs text-muted-foreground">Manage your billing and plan details.</p>
                            </div>
                            <Link 
                                href="https://polar.sh/dashboard" 
                                target="_blank"
                                className="flex items-center gap-2 px-4 py-2 border border-border rounded-sm font-sans text-xs tracking-widest uppercase hover:bg-foreground hover:text-background transition-all"
                            >
                                <ExternalLink size={12} />
                                Manage
                            </Link>
                        </div>
                    </>
                 )}
            </div>
        </section>

        {/* Privacy & Data */}
        <section className="space-y-6">
            <div className="flex items-center gap-2 text-foreground/80">
                <ShieldCheck size={18} />
                <h3 className="font-serif text-lg tracking-wide">Privacy & Data</h3>
            </div>
            <div className="bg-card border border-border p-6 rounded-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <p className="font-serif text-base">Export Your Data</p>
                        <p className="font-sans text-xs text-muted-foreground">Download all your journal entries and chat history in JSON format.</p>
                    </div>
                    <button
                        onClick={handleExportData}
                        disabled={isExporting}
                        className="flex items-center justify-center gap-2 px-6 py-2 border border-border rounded-sm font-sans text-xs tracking-widest uppercase hover:bg-foreground hover:text-background transition-all disabled:opacity-50"
                    >
                        <Download size={14} />
                        {isExporting ? "Exporting..." : "Export JSON"}
                    </button>
                </div>
                
                <div className="h-px bg-border/50" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <p className="font-serif text-base text-red-600">Delete Account</p>
                        <p className="font-sans text-xs text-muted-foreground">Permanently remove your account and all associated data. This cannot be undone.</p>
                    </div>
                    <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="flex items-center justify-center gap-2 px-6 py-2 border border-red-200 text-red-600 rounded-sm font-sans text-xs tracking-widest uppercase hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                    >
                        <Trash2 size={14} />
                        {isDeleting ? "Deleting..." : "Delete All Data"}
                    </button>
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
      <Footer />
    </main>
  )
}
