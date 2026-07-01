export function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return (
    req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip") || null
  );
}
