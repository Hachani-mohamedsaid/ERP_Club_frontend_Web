import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "../dashboard/Sidebar";
import { Topbar } from "../dashboard/Topbar";
import { ToastContainer } from "../scout/ScoutToast";
import { CommandPalette, useCommandPalette } from "../ui/CommandPalette";
import { useAuth } from "../../contexts/AuthContext";

export function AppShell() {
  const { open, close } = useCommandPalette();
  const { isImpersonating, exitImpersonation, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="odin-backdrop" />
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-y-auto">
        {isImpersonating && (
          <div className="flex items-center justify-between gap-4 border-b px-8 py-2 text-sm" style={{ borderColor: "rgba(255,122,0,0.3)", background: "rgba(255,122,0,0.08)" }}>
            <span style={{ color: "var(--text-primary)" }}>
              Mode support — connecté comme <strong>{user?.organization?.clubName ?? "Admin Club"}</strong>
            </span>
            <button
              type="button"
              className="rounded-lg px-3 py-1 text-xs font-semibold"
              style={{ background: "var(--accent)", color: "white" }}
              onClick={() => {
                exitImpersonation();
                navigate("/superadmin/dashboard");
              }}
            >
              Quitter l&apos;impersonation
            </button>
          </div>
        )}
        <Topbar />
        <main className="flex-1 space-y-6 px-8 pb-8">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
      <CommandPalette open={open} onClose={close} />
    </div>
  );
}
