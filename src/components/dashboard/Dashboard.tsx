import { KpiFormation } from "./KpiFormation";
import { PlayersTable } from "./PlayersTable";
import { ContractAlerts } from "./ContractAlerts";

export function Dashboard() {
  return (
    <>
      <KpiFormation />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PlayersTable />
        </div>
        <div>
          <ContractAlerts />
        </div>
      </div>
    </>
  );
}
