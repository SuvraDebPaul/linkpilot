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
