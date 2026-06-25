export const INFRA_TYPE_OPTIONS = ["Terrain", "Salle", "Bus", "Centre médical"] as const;
export const INFRA_STATUS_OPTIONS = ["Excellent", "Bon", "Maintenance"] as const;

export interface InfrastructureMaintenance {
  id: string;
  taskType: string;
  scheduledDate: string;
}

export interface Infrastructure {
  id: string;
  name: string;
  infraType: string;
  status: string;
  capacity: string | null;
  occupationPct: number;
  nextMaintenance: string | null;
  maintenances?: InfrastructureMaintenance[];
}

export function formatInfraDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = iso.split("T")[0];
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return iso;
  return `${day}/${m}/${y}`;
}

function infraCategory(infraType: string): "terrains" | "salles" | "bus" | "centre" {
  const t = infraType.toLowerCase();
  if (t.includes("terrain")) return "terrains";
  if (t.includes("salle")) return "salles";
  if (t.includes("bus")) return "bus";
  if (t.includes("médical") || t.includes("medical") || t.includes("centre")) return "centre";
  return "terrains";
}

export function countInfraByCategory(items: Infrastructure[]) {
  const counts = { terrains: 0, salles: 0, bus: 0, centre: 0 };
  for (const item of items) {
    counts[infraCategory(item.infraType)] += 1;
  }
  return counts;
}

export function normalizeInfrastructure(raw: Record<string, unknown>): Infrastructure {
  const maintenances = Array.isArray(raw.maintenances)
    ? raw.maintenances.map((m) => {
        const row = m as Record<string, unknown>;
        const dateRaw = row.scheduledDate;
        const iso =
          typeof dateRaw === "string"
            ? dateRaw
            : dateRaw instanceof Date
              ? dateRaw.toISOString()
              : "";
        return {
          id: String(row.id ?? ""),
          taskType: String(row.taskType ?? "Maintenance"),
          scheduledDate: iso,
        };
      })
    : [];

  const nextRaw = raw.nextMaintenance;
  const nextMaintenance =
    typeof nextRaw === "string"
      ? nextRaw
      : nextRaw instanceof Date
        ? nextRaw.toISOString()
        : null;

  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    infraType: String(raw.infraType ?? "Terrain"),
    status: String(raw.status ?? "Bon"),
    capacity: raw.capacity ? String(raw.capacity) : null,
    occupationPct: Number(raw.occupationPct ?? 0),
    nextMaintenance,
    maintenances,
  };
}

export interface MaintenanceCalendarEntry {
  id: string;
  infraName: string;
  taskType: string;
  scheduledDate: string;
}

export function buildMaintenanceCalendar(items: Infrastructure[]): MaintenanceCalendarEntry[] {
  const entries: MaintenanceCalendarEntry[] = [];

  for (const infra of items) {
    if (infra.maintenances && infra.maintenances.length > 0) {
      for (const m of infra.maintenances) {
        entries.push({
          id: m.id,
          infraName: infra.name,
          taskType: m.taskType,
          scheduledDate: m.scheduledDate,
        });
      }
    } else if (infra.nextMaintenance) {
      entries.push({
        id: `${infra.id}-next`,
        infraName: infra.name,
        taskType: "Maintenance prévue",
        scheduledDate: infra.nextMaintenance,
      });
    }
  }

  return entries.sort(
    (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime(),
  );
}
