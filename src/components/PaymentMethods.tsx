"use client";

import { useTranslations } from "next-intl";

const paymentMethods = [
  {
    name: "Visa",
    svg: (
      <svg viewBox="0 0 48 32" className="w-12 h-8">
        <rect width="48" height="32" rx="4" fill="#1A1F71" />
        <text x="24" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="Arial, sans-serif">VISA</text>
      </svg>
    ),
  },
  {
    name: "Mastercard",
    svg: (
      <svg viewBox="0 0 48 32" className="w-12 h-8">
        <rect width="48" height="32" rx="4" fill="#252525" />
        <circle cx="19" cy="16" r="8" fill="#EB001B" />
        <circle cx="29" cy="16" r="8" fill="#F79E1B" />
        <path d="M24 10.27a8 8 0 010 11.46 8 8 0 000-11.46z" fill="#FF5F00" />
      </svg>
    ),
  },
  {
    name: "Amex",
    svg: (
      <svg viewBox="0 0 48 32" className="w-12 h-8">
        <rect width="48" height="32" rx="4" fill="#006FCF" />
        <text x="24" y="20" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif">AMEX</text>
      </svg>
    ),
  },
  {
    name: "Apple Pay",
    svg: (
      <svg viewBox="0 0 48 32" className="w-12 h-8">
        <rect width="48" height="32" rx="4" fill="#000000" />
        <text x="24" y="20" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif"> Pay</text>
      </svg>
    ),
  },
  {
    name: "Google Pay",
    svg: (
      <svg viewBox="0 0 48 32" className="w-12 h-8">
        <rect width="48" height="32" rx="4" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="0.5" />
        <text x="24" y="20" textAnchor="middle" fill="#5F6368" fontSize="7" fontWeight="bold" fontFamily="Arial, sans-serif">G Pay</text>
      </svg>
    ),
  },
  {
    name: "PayPal",
    svg: (
      <svg viewBox="0 0 48 32" className="w-12 h-8">
        <rect width="48" height="32" rx="4" fill="#003087" />
        <text x="24" y="20" textAnchor="middle" fill="#009CDE" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif">PayPal</text>
      </svg>
    ),
  },
  {
    name: "Venmo",
    svg: (
      <svg viewBox="0 0 48 32" className="w-12 h-8">
        <rect width="48" height="32" rx="4" fill="#3D95CE" />
        <text x="24" y="20" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif">Venmo</text>
      </svg>
    ),
  },
  {
    name: "Zelle",
    svg: (
      <svg viewBox="0 0 48 32" className="w-12 h-8">
        <rect width="48" height="32" rx="4" fill="#6D1ED4" />
        <text x="24" y="20" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif">Zelle</text>
      </svg>
    ),
  },
  {
    name: "Cash App",
    svg: (
      <svg viewBox="0 0 48 32" className="w-12 h-8">
        <rect width="48" height="32" rx="4" fill="#00D632" />
        <text x="24" y="20" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="Arial, sans-serif">Cash App</text>
      </svg>
    ),
  },
  {
    name: "Cash",
    svg: (
      <svg viewBox="0 0 48 32" className="w-12 h-8">
        <rect width="48" height="32" rx="4" fill="#2E7D32" />
        <text x="24" y="21" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial, sans-serif">$</text>
      </svg>
    ),
  },
];

export default function PaymentMethods() {
  const t = useTranslations("paymentMethods");

  return (
    <section className="py-16 bg-charcoal/30">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="font-heading text-2xl md:text-3xl text-cream mb-2">
          {t("title")}
        </h2>
        <p className="text-cream/50 text-sm mb-8">{t("subtitle")}</p>
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
          {paymentMethods.map((method) => (
            <div
              key={method.name}
              className="opacity-80 hover:opacity-100 transition-opacity duration-200"
              title={method.name}
            >
              {method.svg}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
