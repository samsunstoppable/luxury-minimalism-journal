/**
 * Simple sanitization to remove basic HTML/script tags.
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";
  // Strip HTML tags using regex
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Helper to get the current user from auth or dev fallback.
 */
export async function getCurrentUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  
  if (identity) {
    return await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
  }

  // Fallback for local dev
  const devToken = "dev-user";
  return await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", devToken))
    .unique();
}

