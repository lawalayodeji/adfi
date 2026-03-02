import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

export function calcROAS(revenue: number, spend: number) {
  if (spend === 0) return 0;
  return revenue / spend;
}

export function buildUtmUrl(
  destination: string,
  params: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
  }
) {
  const url = new URL(destination);
  if (params.utmSource) url.searchParams.set("utm_source", params.utmSource);
  if (params.utmMedium) url.searchParams.set("utm_medium", params.utmMedium);
  if (params.utmCampaign) url.searchParams.set("utm_campaign", params.utmCampaign);
  if (params.utmContent) url.searchParams.set("utm_content", params.utmContent);
  if (params.utmTerm) url.searchParams.set("utm_term", params.utmTerm);
  return url.toString();
}
