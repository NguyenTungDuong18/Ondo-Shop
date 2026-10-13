export interface ShippingPolicy { freeShippingThreshold: number; standardFee: number; }
export function calculateShippingFee(subtotal: number, policy: ShippingPolicy): number {
  return subtotal >= policy.freeShippingThreshold ? 0 : policy.standardFee;
}
