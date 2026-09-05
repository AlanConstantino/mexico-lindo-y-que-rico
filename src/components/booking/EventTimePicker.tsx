"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toEventTime } from "@/lib/event-time";

export default function EventTimePicker({ value, onChange }: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const t = useTranslations("booking");
  const [draftMinute, setDraftMinute] = useState("00");
  const [draftPeriod, setDraftPeriod] = useState("PM");
  const hour24 = value ? Number(value.split(":")[0]) : null;
  const hour = hour24 === null ? "" : String(hour24 % 12 || 12);
  const minute = value ? value.split(":")[1] : draftMinute;
  const period = hour24 === null ? draftPeriod : hour24 >= 12 ? "PM" : "AM";
  const selectClass = "mt-1 block w-full rounded-xl border border-amber/20 bg-navy text-cream px-3 py-3 text-base focus:outline-none focus:border-amber [color-scheme:dark]";

  return (
    <fieldset>
      <legend className="sr-only">{t("selectTime")}</legend>
      <div className="grid grid-cols-3 gap-3">
        <label className="text-cream/60 text-sm">
          {t("timeHour")}
          <select value={hour} onChange={(e) => onChange(toEventTime(e.target.value, minute, period))} className={selectClass}>
            <option value="" disabled>{t("chooseHour")}</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </label>
        <label className="text-cream/60 text-sm">
          {t("timeMinute")}
          <select value={minute} onChange={(e) => {
            setDraftMinute(e.target.value);
            onChange(toEventTime(hour, e.target.value, period));
          }} className={selectClass}>
            {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="text-cream/60 text-sm">
          {t("timePeriod")}
          <select value={period} onChange={(e) => {
            setDraftPeriod(e.target.value);
            onChange(toEventTime(hour, minute, e.target.value));
          }} className={selectClass}>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </label>
      </div>
    </fieldset>
  );
}
