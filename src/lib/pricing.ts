export type ServiceType = "2hr" | "3hr";

export type MeatId =
  | "asada"
  | "pastor"
  | "chicken"
  | "chorizo"
  | "fish"
  | "shrimp"
  | "veggies"
  | "alambres";

export type AguaFlavor =
  | "horchata"
  | "jamaica"
  | "tamarindo"
  | "limon"
  | "pina";

export const AGUA_FLAVORS: AguaFlavor[] = [
  "horchata",
  "jamaica",
  "tamarindo",
  "limon",
  "pina",
];

export type AguaFlavorQuantities = Partial<Record<AguaFlavor, number>>;

export type ExtraMeatQuantities = Partial<Record<MeatId, number>>;

export type ExtraId =
  | "rice"
  | "beans"
  | "quesadillas"
  | "jalapenos"
  | "guacamole"
  | "salsa"
  | "agua"
  | "salad"
  | "burgers"
  | "hotdogs"
  | "baconHotdogs"
  | "chips"
  | "extraTime"
  | "extraMeat";

export const MEAT_OPTIONS: MeatId[] = [
  "asada",
  "pastor",
  "chicken",
  "chorizo",
  "fish",
  "shrimp",
  "veggies",
  "alambres",
];

export interface GuestOption {
  count: number;
  price: number;
}

export const GUEST_OPTIONS: Record<ServiceType, GuestOption[]> = {
  "2hr": [
    { count: 50, price: 595 },
    { count: 75, price: 695 },
  ],
  "3hr": [
    { count: 100, price: 795 },
    { count: 125, price: 895 },
    { count: 150, price: 995 },
    { count: 175, price: 1095 },
    { count: 200, price: 1350 },
  ],
};

export interface ExtraOption {
  id: ExtraId;
  price: number;
  perUnit: boolean;
}

export const EXTRA_OPTIONS: ExtraOption[] = [
  { id: "rice", price: 50, perUnit: false },
  { id: "beans", price: 50, perUnit: false },
  { id: "quesadillas", price: 60, perUnit: false },
  { id: "jalapenos", price: 25, perUnit: false },
  { id: "guacamole", price: 60, perUnit: false },
  { id: "salsa", price: 60, perUnit: false },
  { id: "agua", price: 35, perUnit: false },
  { id: "salad", price: 45, perUnit: false },
  { id: "burgers", price: 5, perUnit: true },
  { id: "hotdogs", price: 3, perUnit: true },
  { id: "baconHotdogs", price: 4, perUnit: true },
  { id: "chips", price: 30, perUnit: false },
  { id: "extraTime", price: 60, perUnit: true },
  { id: "extraMeat", price: 60, perUnit: true },
];

// Bookings created before price snapshots used this catalog. Never reprice them
// using today's rates when sending a reminder or confirmation.
const LEGACY_EXTRA_PRICES: Partial<Record<string, number>> = {
  rice: 40, beans: 40, quesadillas: 30, jalapenos: 20,
  guacamole: 40, salsa: 40, agua: 25, salad: 30,
  burgers: 4, hotdogs: 2, extraTime: 40, extraMeat: 40,
};

export interface BookedExtra {
  id: string;
  quantity: number;
  /** Price per unit in dollars, captured by the server at checkout. */
  unitPrice?: number;
  flavors?: Record<string, number> | string[];
  meatSelections?: Record<string, number>;
}

export function getBookedExtraPrice(extra: BookedExtra): number {
  return extra.unitPrice ?? LEGACY_EXTRA_PRICES[extra.id]
    ?? EXTRA_OPTIONS.find((option) => option.id === extra.id)?.price ?? 0;
}

export function isValidPackage(serviceType: unknown, guestCount: unknown): serviceType is ServiceType {
  return (serviceType === "2hr" || serviceType === "3hr")
    && GUEST_OPTIONS[serviceType].some((option) => option.count === guestCount);
}

export function getBasePrice(
  serviceType: ServiceType,
  guestCount: number
): number {
  const options = GUEST_OPTIONS[serviceType];
  const option = options?.find((o) => o.count === guestCount);
  return option?.price ?? 0;
}

export function getExtrasTotal(
  extras: Partial<Record<ExtraId, number>>
): number {
  let total = 0;
  for (const extra of EXTRA_OPTIONS) {
    const qty = extras[extra.id] || 0;
    total += qty * extra.price;
  }
  return total;
}

export function calculateSurcharge(subtotal: number, percent: number): number {
  return Math.round(subtotal * (percent / 100));
}

/** Returns processing fee in dollars. flatCents is in cents (e.g., 30 = $0.30) */
export function calculateProcessingFee(subtotal: number, percent: number, flatCents: number): number {
  return Math.round(subtotal * (percent / 100) * 100 + flatCents) / 100;
}

export function calculateDeposit(subtotal: number, percent: number): number {
  return Math.round(subtotal * (percent / 100) * 100) / 100;
}

export function calculateTotal(
  serviceType: ServiceType,
  guestCount: number,
  extras: Partial<Record<ExtraId, number>>
): number {
  return getBasePrice(serviceType, guestCount) + getExtrasTotal(extras);
}
