function slug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function rosterTeamId(countryId: string, name: string) {
  return `${countryId}-${slug(name)}`;
}

export function normalizeClubName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/fc|cf|ac|sc|us|as|js|es|ca|ol|om/gi, "")
    .replace(/[^a-z0-9]/g, "");
}
