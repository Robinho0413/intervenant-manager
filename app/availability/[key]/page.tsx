import React from "react";
import Calendar from "@/app/ui/calendar";
import { fetchIntervenantByKey } from "@/app/lib/data";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { key: string } }) {
  const { key } = params;

  if (!key) {
    notFound();
  }

  const intervenantData = await fetchIntervenantByKey(key);

  if (!intervenantData) {
    notFound();
  }

  const startDate = new Date(new Date().getFullYear(), 8, 2); // 2 Septembre
  const endDate = new Date(new Date().getFullYear() + 1, 5, 30); // 30 Juin

  return (
    <Calendar intervenant={intervenantData} startDate={startDate} endDate={endDate} />
  );
}
