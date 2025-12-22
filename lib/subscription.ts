export function isPremiumUser(status?: string): boolean {
  return status === "active";
}

export const SUBSCRIPTION_PRICE = "$9.99";
export const SUBSCRIPTION_PRICE_CENTS = 999;
