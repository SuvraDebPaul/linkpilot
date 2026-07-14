// Every Server Action's "not logged in" check returns this exact string, so
// the shared toast wrapper (src/lib/toast.ts) can recognize a session that
// expired or was revoked mid-flow and send the user to sign back in, instead
// of leaving them staring at a bare "Unauthorized" toast with no way to
// recover short of guessing they should reload.
export const SESSION_EXPIRED_MESSAGE = "Your session has expired. Please sign in again.";
