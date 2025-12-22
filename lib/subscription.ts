export function isPremiumUser(status?: string): boolean {
  return status === "active";
}

export const SUBSCRIPTION_PRICE = "$59";
export const SUBSCRIPTION_PRICE_CENTS = 5900;
