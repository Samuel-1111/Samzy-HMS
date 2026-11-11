/** Generic system identity. No hospital tenant or public hospital profile is configured yet. */
export const hospital = {
  name: process.env.NEXT_PUBLIC_HOSPITAL_NAME ?? "Hospital Workspace",
  shortName: process.env.NEXT_PUBLIC_HOSPITAL_SHORT_NAME ?? "Hospital",
  tagline: "Connected care operations",
  city: "",
  state: "",
  country: "Nigeria",
  address: "",
  phone: "",
  email: "",
  website: "",
  services: [] as string[],
} as const;

export const appIdentity = {
  name: "Samzy HMS",
  byline: "Built by Samzy Technology",
} as const;
