export type RetargetingPixel = {
  type: "meta" | "google" | "tiktok" | "linkedin";
  id: string;
};

// Sanitize pixel IDs — each platform has a known safe character set
const sanitize: Record<RetargetingPixel["type"], (id: string) => string> = {
  meta:     (id) => id.replace(/[^0-9]/g, ""),
  google:   (id) => id.replace(/[^A-Z0-9_/-]/gi, ""),
  tiktok:   (id) => id.replace(/[^A-Z0-9]/gi, ""),
  linkedin: (id) => id.replace(/[^0-9]/g, ""),
};

function metaScript(id: string) {
  return `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');</script><noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1"/></noscript>`;
}

function googleScript(id: string) {
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}');</script>`;
}

function tiktokScript(id: string) {
  return `<script>!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var s=document.createElement("script");s.type="text/javascript",s.async=!0,s.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(s,a)};ttq.load('${id}');ttq.page();}(window,document,'ttq');</script>`;
}

function linkedinScript(id: string) {
  return `<script>_linkedin_partner_id="${id}";window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);</script><script>(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s)})(window.lintrk);</script><noscript><img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=${id}&fmt=gif"/></noscript>`;
}

const scriptBuilders: Record<RetargetingPixel["type"], (id: string) => string> = {
  meta:     metaScript,
  google:   googleScript,
  tiktok:   tiktokScript,
  linkedin: linkedinScript,
};

export function buildOgMeta(ogTitle?: string | null, ogDescription?: string | null, ogImage?: string | null): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let tags = "";
  if (ogTitle)       tags += `<meta property="og:title" content="${esc(ogTitle)}"><meta name="twitter:title" content="${esc(ogTitle)}">`;
  if (ogDescription) tags += `<meta property="og:description" content="${esc(ogDescription)}"><meta name="twitter:description" content="${esc(ogDescription)}">`;
  if (ogImage)       tags += `<meta property="og:image" content="${esc(ogImage)}"><meta name="twitter:image" content="${esc(ogImage)}"><meta name="twitter:card" content="summary_large_image">`;
  return tags;
}

export function buildPixelPage(
  pixels: RetargetingPixel[],
  destination: string,
  opts: { isCloaked?: boolean; hideReferrer?: boolean; ogTitle?: string | null; ogDescription?: string | null; ogImage?: string | null } = {},
): string {
  const escapedDest = JSON.stringify(destination);
  const safeDest = destination.replace(/[<>"]/g, "");
  const referrerMeta = opts.hideReferrer ? `<meta name="referrer" content="no-referrer">` : "";
  const ogMeta = buildOgMeta(opts.ogTitle, opts.ogDescription, opts.ogImage);

  const scripts = pixels
    .map((p) => {
      const safeId = sanitize[p.type](p.id);
      if (!safeId) return "";
      return scriptBuilders[p.type](safeId);
    })
    .join("");

  // Cloaked: fire pixels then load destination in iframe (URL stays as short link)
  if (opts.isCloaked) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="robots" content="noindex">${referrerMeta}${ogMeta}${scripts}<style>*{margin:0;padding:0}html,body,iframe{width:100%;height:100%;border:none;overflow:hidden}</style></head><body><script>setTimeout(function(){var f=document.createElement('iframe');f.src=${escapedDest};f.style.cssText='width:100%;height:100%;border:none';document.body.appendChild(f)},150)</script><noscript><meta http-equiv="refresh" content="0;url=${safeDest}"></noscript></body></html>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="robots" content="noindex">${referrerMeta}${ogMeta}${scripts}</head><body><script>setTimeout(function(){window.location.replace(${escapedDest})},150)</script><noscript><meta http-equiv="refresh" content="0;url=${safeDest}"></noscript></body></html>`;
}
