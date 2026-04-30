/** Shared layout wrapper for dashboard pages (padding + max width). Navigation is in `GlobalTopNav`. */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-7xl px-4 pb-8 pt-2 md:px-8">{children}</div>;
}
