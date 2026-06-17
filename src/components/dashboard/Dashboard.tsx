import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { KpiFormation } from "./KpiFormation";
import { PlayersTable } from "./PlayersTable";
import { ContractAlerts } from "./ContractAlerts";

export function Dashboard() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="odin-backdrop" />
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-6 px-8 pb-8">
          <KpiFormation />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PlayersTable />
            </div>
            <div>
              <ContractAlerts />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
