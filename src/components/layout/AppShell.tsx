import { Outlet } from "react-router-dom";
import { Sidebar } from "../dashboard/Sidebar";
import { Topbar } from "../dashboard/Topbar";
import { ToastContainer } from "../scout/ScoutToast";
import { CommandPalette, useCommandPalette } from "../ui/CommandPalette";

export function AppShell() {
  const { open, close } = useCommandPalette();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="odin-backdrop" />
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-y-auto">
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
