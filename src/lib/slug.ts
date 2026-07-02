import { randomInt } from "crypto";

import { RESERVED_SLUGS } from "@/constants/routes";

const alphabet =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function generateShortCode(length = 8) {
  let code = "";

  for (let i = 0; i < length; i++) {
    code += alphabet[randomInt(0, alphabet.length)];
  }

  return code;
}

export function isReservedSlug(slug: string) {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}

export type SlugStyle = "incremental" | "random" | "secure";

// Base62 alphabet — used to keep incremental counters short.
const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function counterToSlug(counter: number): string {
  if (counter === 0) return BASE62[0];
  let n = counter;
  let out = "";
  while (n > 0) {
    out = BASE62[n % 62] + out;
    n = Math.floor(n / 62);
  }
  return out;
}

export function shortCodeLengthForStyle(style: SlugStyle): number {
  if (style === "secure") return 12;
  return 6; // "random" default
}
