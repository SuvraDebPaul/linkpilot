import crypto from "crypto";

function getHashSecret(): string {
  const secret = process.env.APP_HASH_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("APP_HASH_SECRET environment variable is not set.");
    }

    return "dev-secret";
  }

  return secret;
}

export function hashValue(value: string) {
  return crypto
    .createHash("sha256")
    .update(`${value}:${getHashSecret()}`)
    .digest("hex");
}
