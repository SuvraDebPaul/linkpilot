import { GuestLinkForm } from "@/features/guest-links";

export function FreeDemoSection() {
  return (
    <section
      id="try-it"
      className="border-b border-slate-200 bg-white px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              No login required
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Try it now — see what your link becomes
            </h2>
            <p className="mt-3 text-base text-slate-500">
              Create a short link and QR code in seconds. Sign up to track
              performance, manage campaigns, and share client reports.
            </p>
          </div>

          <GuestLinkForm />
        </div>
      </div>
    </section>
  );
}
