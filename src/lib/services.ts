export type Service = {
  slug: string;
  name: string;
  short: string;
  description: string;
  details: string[];
  uses: string[];
};

export const SERVICES: Service[] = [
  {
    slug: "relocation-survey",
    name: "Relocation Survey",
    short: "Re-establish lost or disputed property corners using the original technical description.",
    description:
      "A relocation survey re-marks the original boundaries of your titled lot on the ground. We work from your existing title or technical description to recover lost monuments, settle boundary disputes, and give you a clear, defensible perimeter.",
    details: [
      "Recovery and verification of original lot corners",
      "Setting of permanent monuments where corners are lost",
      "Sketch plan and field notes for record",
      "Adjoining-owner notification when required",
    ],
    uses: ["Boundary disputes", "Pre-construction layout", "Fence installation", "Title verification"],
  },
  {
    slug: "subdivision-survey",
    name: "Subdivision Survey",
    short: "Divide a single titled property into two or more legally distinct parcels.",
    description:
      "Subdivision surveys split one mother title into smaller lots — useful for inheritance, sale, or development. We prepare the subdivision plan for approval by DENR/LRA so each new lot can be issued its own title.",
    details: [
      "Lot planning and area computations",
      "Preparation of subdivision plan (Psd)",
      "Submission and follow-through with DENR",
      "Coordination with adjoining owners and barangay",
    ],
    uses: ["Estate partitioning", "Sale of portions", "Housing developments"],
  },
  {
    slug: "consolidation-survey",
    name: "Consolidation Survey",
    short: "Merge two or more adjoining lots into a single titled property.",
    description:
      "When you own multiple adjacent lots, a consolidation survey combines them into one parcel under a single title. Ideal for simplifying ownership and unlocking larger projects on contiguous land.",
    details: [
      "Verification of titles and adjoining boundaries",
      "Preparation of consolidation plan (Ccs)",
      "Document preparation for LRA submission",
    ],
    uses: ["Single-title ownership", "Commercial development", "Farm consolidation"],
  },
  {
    slug: "segregation-survey",
    name: "Segregation Survey",
    short: "Carve out a specific portion from a larger lot without subdividing the whole.",
    description:
      "A segregation survey isolates a defined area from a mother lot — typically for sale, donation, or right-of-way — while leaving the remaining area intact under the original title.",
    details: [
      "Field measurement of the segregated portion",
      "Preparation of segregation plan",
      "Coordination with concerned agencies",
    ],
    uses: ["Partial sale", "Road right-of-way", "Donation of portion"],
  },
  {
    slug: "as-built-survey",
    name: "As-Built Survey",
    short: "Document the actual location of structures and improvements after construction.",
    description:
      "An as-built survey records exactly where buildings, utilities, and improvements were placed on the ground after construction. Required for occupancy permits, refinancing, and verifying compliance with approved plans.",
    details: [
      "Measurement of completed structures",
      "Verification against original plans",
      "Drafted as-built plan with vicinity",
    ],
    uses: ["Occupancy permit", "Bank refinancing", "Construction verification"],
  },
  {
    slug: "sketch-plan-with-vicinity",
    name: "Sketch Plan with Vicinity",
    short: "Detailed sketch of your lot showing dimensions, area, and surrounding landmarks.",
    description:
      "A sketch plan with vicinity map gives a clear, signed visual of your property — its dimensions, area, and location relative to roads, neighbors, and landmarks. Commonly required for permits, loans, and formal applications.",
    details: [
      "Lot boundary and dimensions",
      "Area and bearings",
      "Vicinity map with landmarks",
      "Signed and sealed by Geodetic Engineer",
    ],
    uses: ["Bank loans", "Building permits", "Government applications"],
  },
  {
    slug: "sketch-plan-printing",
    name: "Sketch Plan Printing",
    short: "Professional printing of approved sketch plans on standard plan-sized paper.",
    description:
      "Need clean, properly scaled prints of your existing sketch plans? We offer professional plan printing on the correct paper size and quality required by government offices and lending institutions.",
    details: [
      "Standard plan paper sizes",
      "True-to-scale output",
      "Multiple copies available",
    ],
    uses: ["Document submissions", "Office records", "Permit applications"],
  },
];

export const FACEBOOK_URL = "https://facebook.com/ranolasurveying";
export const PHONE = "09121181559";
export const EMAIL = "ranolasurveying@gmail.com";
export const ADDRESS = "San Roque St., Poblacion 1, Mobo, Masbate";
