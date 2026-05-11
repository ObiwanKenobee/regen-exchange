import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Mail, Volume2 } from "lucide-react";
import { setNotificationPrefs, useNotificationPrefs, playNotifySound } from "@/lib/notification-prefs";

export function NotificationSettings() {
  const prefs = useNotificationPrefs();
  const activeCount = [prefs.orders, prefs.verification].filter(Boolean).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-sm hover:bg-muted/60"
          title="Notification settings"
        >
          <Bell className="h-4 w-4 text-primary" />
          <span className="hidden md:inline">Notify</span>
          {activeCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] text-background">{activeCount}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 border-border bg-card p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Notifications</div>
        <div className="mt-3 space-y-2 text-sm">
          <Toggle
            label="Order events"
            hint="Confirm / fail toasts for trades"
            checked={prefs.orders}
            onChange={(v) => setNotificationPrefs({ orders: v })}
          />
          <Toggle
            label="Verification events"
            hint="Toast when new events match saved filters"
            checked={prefs.verification}
            onChange={(v) => setNotificationPrefs({ verification: v })}
          />
          <Toggle
            label={<span className="flex items-center gap-1"><Volume2 className="h-3 w-3" /> Sound</span>}
            hint="Short chime with each notification"
            checked={prefs.sound}
            onChange={(v) => { setNotificationPrefs({ sound: v }); if (v) playNotifySound("info"); }}
          />
          <Toggle
            label={<span className="flex items-center gap-1"><Mail className="h-3 w-3" /> Email <span className="rounded bg-muted px-1 text-[9px] uppercase tracking-wider text-muted-foreground">soon</span></span>}
            hint="Daily digest — coming soon"
            checked={prefs.email}
            onChange={(v) => setNotificationPrefs({ email: v })}
            disabled
          />
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground">Preferences are saved on this device and persist across sessions.</p>
      </PopoverContent>
    </Popover>
  );
}

function Toggle({ label, hint, checked, onChange, disabled }: { label: React.ReactNode; hint?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className={`flex items-start justify-between gap-3 rounded-md border border-border bg-muted/20 p-2.5 ${disabled ? "opacity-60" : "cursor-pointer hover:bg-muted/30"}`}>
      <div>
        <div className="font-medium leading-tight">{label}</div>
        {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
      </div>
      <input type="checkbox" disabled={disabled} className="mt-1 accent-primary" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}