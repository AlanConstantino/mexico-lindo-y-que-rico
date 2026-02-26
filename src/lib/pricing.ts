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
  | "hotdogs";

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
    { count: 25, price: 395 },
    { count: 50, price: 495 },
    { count: 75, price: 595 },
  ],
  "3hr": [
    { count: 100, price: 695 },
    { count: 125, price: 795 },
    { count: 150, price: 895 },
    { count: 175, price: 995 },
    { count: 200, price: 1095 },
  ],
};

export interface ExtraOption {
  id: ExtraId;
  price: number;
  perUnit: boolean;
}

export const EXTRA_OPTIONS: ExtraOption[] = [
  { id: "rice", price: 40, perUnit: false },
  { id: "beans", price: 40, perUnit: false },
  { id: "quesadillas", price: 30, perUnit: false },
  { id: "jalapenos", price: 20, perUnit: false },
  { id: "guacamole", price: 40, perUnit: false },
  { id: "salsa", price: 40, perUnit: false },
  { id: "agua", price: 25, perUnit: false },
  { id: "salad", price: 30, perUnit: false },
  { id: "burgers", price: 4, perUnit: true },
  { id: "hotdogs", price: 2, perUnit: true },
];

export function getBasePrice(
  serviceType: ServiceType,
  guestCount: number
): number {
  const options = GUEST_OPTIONS[serviceType];
  const option = options.find((o) => o.count === guestCount);
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

export function calculateTotal(
  serviceType: ServiceType,
  guestCount: number,
  extras: Partial<Record<ExtraId, number>>
): number {
  return getBasePrice(serviceType, guestCount) + getExtrasTotal(extras);
}
