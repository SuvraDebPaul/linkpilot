import { getSiteSetting } from "@/lib/site-settings";
import { SiteSettingsPanel } from "@/components/admin/site-settings-panel";

export default async function AdminConfigPage() {
  const bannerRaw = await getSiteSetting("announcementBanner", '{"enabled":false,"message":""}');
  const bannerParsed = (() => {
    try {
      return JSON.parse(bannerRaw) as { enabled: boolean; message: string };
    } catch {
      return { enabled: false, message: "" };
    }
  })();
  const supportEmail = await getSiteSetting("supportEmail", "hello@linkpilot.app");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-100">Site Settings</h1>
      <p className="mt-1 text-sm text-zinc-500">Config an admin can change without a deploy.</p>

      <div className="mt-4 max-w-xl">
        <SiteSettingsPanel
          bannerEnabled={bannerParsed.enabled}
          bannerMessage={bannerParsed.message}
          supportEmail={supportEmail}
        />
      </div>
    </div>
  );
}
