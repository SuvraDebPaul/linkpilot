import { Clock, CreditCard, FileText, ShieldCheck, Zap } from "lucide-react";

const signals = [
  { icon: CreditCard, text: "No credit card to start" },
  { icon: Zap,         text: "60 seconds to your first link" },
  { icon: FileText,    text: "Client reports need no login" },
  { icon: ShieldCheck, text: "HTTPS on every link" },
  { icon: Clock,       text: "Links never expire on paid plans" },
];

export function TrustBar() {
  return (
    <div className="border-b border-slate-200 bg-white px-4 py-3.5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {signals.map(({ icon: Icon, text }, i) => (
            <li key={text} className="flex items-center gap-1.5">
              {i > 0 && (
                <span className="mr-4 hidden h-3.5 w-px bg-slate-200 sm:inline-block" aria-hidden />
              )}
              <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="text-xs font-medium text-slate-600">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
