"use client";

import { useEffect, useState } from "react";

export function LiveDate() {
  const [date, setDate] = useState(() => formatLiveDate(new Date()));

  useEffect(() => {
    const update = () => setDate(formatLiveDate(new Date()));
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return <span>{date}</span>;
}

function formatLiveDate(value: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(value);
}
