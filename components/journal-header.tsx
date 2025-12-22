"use client"

import { Menu, X, Plus, User, Crown } from "lucide-react"
import Link from "next/link"
import { useAction, useQuery } from "convex/react"
import { api } from "../convex/_generated/api"
import { toast } from "sonner"

interface JournalHeaderProps {
  onNewEntry: () => void
  onToggleMenu: () => void
  menuOpen: boolean
  hasEntries: boolean
}

export function JournalHeader({ onNewEntry, onToggleMenu, menuOpen, hasEntries }: JournalHeaderProps) {
  const createCheckout = useAction(api.polar.createCheckout);
  const user = useQuery(api.users.get);

  const handleSubscribe = async () => {
    try {
      const { url } = await createCheckout({});
      if (url) window.location.href = url;
    } catch (error) {
      toast.error("Failed to start checkout");
      console.error(error);
    }
  };

  const isSubscribed = user?.subscriptionStatus === "active";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Menu toggle */}
          <button
            onClick={onToggleMenu}
            className="p-2 -ml-2 text-foreground hover:opacity-60 transition-opacity duration-300"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <h1 className="font-serif text-lg md:text-xl tracking-widest text-foreground">Journal</h1>

          <div className="flex items-center gap-2 -mr-2">
            {!isSubscribed && (
              <button
                  onClick={handleSubscribe}
                  className="p-2 text-amber-500 hover:opacity-80 transition-opacity duration-300"
                  aria-label="Subscribe"
                  title="Subscribe for $99/mo"
              >
                  <Crown size={20} />
              </button>
            )}
            {/* New entry button */}
            <button
                onClick={onNewEntry}
                className="p-2 text-foreground hover:opacity-60 transition-opacity duration-300"
                aria-label="New entry"
            >
                <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Subtle divider */}
      <div className="h-px bg-border/50" />
    </header>
  )
}
