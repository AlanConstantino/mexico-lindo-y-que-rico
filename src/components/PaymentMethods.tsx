"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";

const allPaymentMethods = [
  { name: "Visa", src: "/payment-icons/visa.svg", toggleKey: null },
  { name: "Mastercard", src: "/payment-icons/mastercard.svg", toggleKey: null },
  { name: "American Express", src: "/payment-icons/amex.svg", toggleKey: null },
  { name: "Apple Pay", src: "/payment-icons/apple-pay.svg", toggleKey: null },
  { name: "Google Pay", src: "/payment-icons/google-pay.svg", toggleKey: null },
  { name: "PayPal", src: "/payment-icons/paypal.svg", toggleKey: "paypal_enabled" },
  { name: "Venmo", src: "/payment-icons/venmo.svg", toggleKey: "venmo_enabled" },
  { name: "Zelle", src: "/payment-icons/zelle.svg", toggleKey: "zelle_enabled" },
  { name: "Cash App", src: "/payment-icons/cashapp.svg", toggleKey: "cashapp_enabled" },
  { name: "Cash", src: "/payment-icons/cash.svg", toggleKey: null },
];

export default function PaymentMethods() {
  const t = useTranslations("paymentMethods");
  const [enabledFlags, setEnabledFlags] = useState<Record<string, boolean>>({
    zelle_enabled: true,
    paypal_enabled: true,
    cashapp_enabled: true,
    venmo_enabled: true,
  });

  useEffect(() => {
    fetch("/api/settings/public")
      .then((res) => res.json())
      .then((d) => setEnabledFlags({
        zelle_enabled: d.zelle_enabled ?? true,
        paypal_enabled: d.paypal_enabled ?? true,
        cashapp_enabled: d.cashapp_enabled ?? true,
        venmo_enabled: d.venmo_enabled ?? true,
      }))
      .catch(() => {});
  }, []);

  const visibleMethods = allPaymentMethods.filter(
    (m) => m.toggleKey === null || enabledFlags[m.toggleKey]
  );

  return (
    <section className="py-20 sm:py-28 bg-charcoal/30">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="font-heading text-3xl md:text-4xl text-cream mb-3">
          {t("title")}
        </h2>
        <p className="text-cream/50 text-base mb-10">{t("subtitle")}</p>
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
          {visibleMethods.map((method) => (
            <div
              key={method.name}
              className="opacity-80 hover:opacity-100 transition-opacity duration-200"
              title={method.name}
            >
              <Image
                src={method.src}
                alt={method.name}
                width={90}
                height={57}
                className="rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
