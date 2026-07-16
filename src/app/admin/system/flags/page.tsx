import { getFeatureFlags } from "@/server/queries/admin-system.queries";
import { FeatureFlagsPanel } from "@/components/admin/feature-flags-panel";

export default async function AdminFeatureFlagsPage() {
  const flags = await getFeatureFlags();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-100">Feature Flags</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Manual kill switches. <span className="font-mono">maintenanceMode</span> and{" "}
        <span className="font-mono">signupsEnabled</span> are already wired into the app — create them here to
        use them.
      </p>

      <div className="mt-4">
        <FeatureFlagsPanel flags={flags} />
      </div>
    </div>
  );
}
