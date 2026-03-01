"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

const paymentMethods = [
  { name: "Visa", src: "/payment-icons/visa.svg" },
  { name: "Mastercard", src: "/payment-icons/mastercard.svg" },
  { name: "American Express", src: "/payment-icons/amex.svg" },
  { name: "Apple Pay", src: "/payment-icons/apple-pay.svg" },
  { name: "Google Pay", src: "/payment-icons/google-pay.svg" },
  { name: "PayPal", src: "/payment-icons/paypal.svg" },
  { name: "Venmo", src: "/payment-icons/venmo.svg" },
  { name: "Zelle", src: "/payment-icons/zelle.svg" },
  { name: "Cash App", src: "/payment-icons/cashapp.svg" },
  { name: "Cash", src: "/payment-icons/cash.svg" },
];

export default function PaymentMethods() {
  const t = useTranslations("paymentMethods");

  return (
    <section className="py-20 sm:py-28 bg-charcoal/30">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="font-heading text-3xl md:text-4xl text-cream mb-3">
          {t("title")}
        </h2>
        <p className="text-cream/50 text-base mb-10">{t("subtitle")}</p>
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
          {paymentMethods.map((method) => (
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
