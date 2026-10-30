import { useRouterState } from "@tanstack/react-router";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileNav from "./MobileNav";
import ToastContainer from "@/components/common/ToastContainer";
import ShutdownWarningModal from "@/components/shutdown/ShutdownWarningModal";
import FocusModeOverlay from "@/components/mobile/FocusModeOverlay";
import { useApp } from "@/store/AppStore";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }) {
  const { toasts, dismissToast, settings } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative flex min-h-dvh bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 islamic-pattern opacity-40" />
        <div className="absolute -left-40 -top-40 size-[520px] rounded-full bg-primary/10 blur-3xl animate-drift" />
        <div className="absolute -bottom-52 -right-40 size-[520px] rounded-full bg-chart-2/10 blur-3xl animate-drift" />
      </div>

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main
          key={pathname}
          className={cn(
            "flex-1 animate-fade-up px-4 py-6 lg:px-8 lg:py-8",
            settings.compactMode ? "space-y-4" : "space-y-6",
          )}
        >
          {children}
        </main>
        <MobileNav />
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <ShutdownWarningModal />
      <FocusModeOverlay />
    </div>
  );
}