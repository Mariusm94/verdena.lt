"use client";

import { FormEvent } from "react";
import { club } from "@/data/site";

export function clubMailto(subject: string, body: string, email = club.email) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function openClubMail(
  event: FormEvent<HTMLFormElement>,
  subject: string,
  body: string,
  email = club.email,
) {
  event.preventDefault();
  window.location.href = clubMailto(subject, body, email);
}
