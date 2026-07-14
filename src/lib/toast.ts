"use client";

import { toast as sonnerToast } from "sonner";
import { SESSION_EXPIRED_MESSAGE } from "@/lib/auth-messages";

export { SESSION_EXPIRED_MESSAGE };

function redirectToLogin() {
  if (typeof window === "undefined") return;
  const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `/login?callbackUrl=${callbackUrl}`;
}

type ToastMessage = Parameters<typeof sonnerToast.error>[0];
type ToastData = Parameters<typeof sonnerToast.error>[1];

// No code in this app calls bare `toast(...)` — only the methods below — so
// this object (rather than sonner's own callable-function type) is all that's
// needed and avoids fighting TypeScript over the call signature.
export const toast = {
  ...sonnerToast,
  error(message: ToastMessage, data?: ToastData) {
    if (message === SESSION_EXPIRED_MESSAGE) {
      const id = sonnerToast.error(message, data);
      setTimeout(redirectToLogin, 1500);
      return id;
    }
    return sonnerToast.error(message, data);
  },
};
