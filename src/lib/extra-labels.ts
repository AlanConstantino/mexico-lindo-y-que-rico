import en from "../../messages/en.json";
import es from "../../messages/es.json";

const labels: Record<string, Record<string, unknown>> = {
  en: en.extras.items,
  es: es.extras.items,
};

/** Shared names for Stripe, emails, and admin, matching the storefront. */
export function getExtraName(id: string, locale: string = "en"): string {
  const name = (labels[locale] ?? labels.en)[id];
  return typeof name === "string" ? name : id;
}
