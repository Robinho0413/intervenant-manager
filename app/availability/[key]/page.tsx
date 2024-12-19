import React from "react";
import Calendar from "@/app/ui/calendar";
import { fetchIntervenantByKey } from "@/app/lib/data";
import { notFound } from "next/navigation";
import { PageProps } from "@/app/lib/definitions/availability";

export default async function Page({ params }: PageProps) {
  const { key } = await params;

  if (!key) {
    notFound();
  }

  const intervenantData = await fetchIntervenantByKey(key);

  if (!intervenantData) {
    notFound();
  }

  if (intervenantData && intervenantData.isKeyExpired) {
    return (
      <div>
        <h1>Clé expirée.</h1>
      </div>
    );
  }

  const startDate = new Date(new Date().getFullYear(), 8, 2); // 2 Septembre
  const endDate = new Date(new Date().getFullYear() + 1, 5, 30); // 30 Juin

  return (
    <Calendar intervenant={intervenantData} startDate={startDate} endDate={endDate} />
  );
}
