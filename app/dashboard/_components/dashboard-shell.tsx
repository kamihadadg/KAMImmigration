/** Shared layout wrapper for dashboard pages (padding + max width). Navigation is in `GlobalTopNav`. */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-7xl px-4 pb-12 pt-4 md:px-8 md:pb-16 md:pt-6">{children}</div>;
}
