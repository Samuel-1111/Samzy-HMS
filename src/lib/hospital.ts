/** Public demo configuration only. Coxwell is a prospect, not a confirmed customer. */
export const hospital = {
  name: "Coxwell Specialist Hospital", shortName: "Coxwell", tagline: "Passion to care, skill to heal",
  city: "Abeokuta", state: "Ogun State", country: "Nigeria",
  address: "1, Omolaja Badmos Street, Leme, Abeokuta, Ogun State.",
  phone: "+234 810 259 9983", fertilityPhone: "+234 702 652 9479",
  email: "info@coxwellhospital.com", website: "https://www.coxwellhospital.com",
  services: ["Laboratory Services","Maternity and Gynaecology","Ultrasound Scanning","Family and Child Health","Medical and Surgical Services","Emergency Care","Specialist Consultations","Assisted Reproductive Technology"]
} as const;
export const appIdentity = { name: "Samzy HMS", byline: "Built by Samzy Technology", demoLabel: "DEMONSTRATION ENVIRONMENT" } as const;
