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
    slug: "topographic-hydrographic-survey",
    name: "Topographic & Hydrographic Survey",
    short: "Measure land elevation and underwater features for planning, design, and development.",
    description:
      "Topographic and hydrographic surveys provide detailed data about the physical features of land and water. Topographic surveys capture terrain, elevations, and surface features, while hydrographic surveys measure water depth, seabed profiles, and underwater conditions — essential for engineering, construction, and environmental planning.",
    details: [
      "Ground elevation and contour mapping",
      "Location of natural and man-made features",
      "Bathymetric survey (water depth measurement)",
      "Seabed and riverbed profiling",
      "Data processing and survey plans",
    ],
    uses: [
      "Site development planning",
      "Road and infrastructure design",
      "Flood and drainage studies",
      "Coastal and marine projects",
    ],
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
  {
    slug: "lot-approval-process",
    name: "Approval Process (Subdivision, Segregation, Consolidation)",
    short: "Handle the legal approval of land division or combination for new title issuance.",
    description:
      "We assist in the complete approval process for subdivided, segregated, or consolidated lots. This includes preparing documents, submitting plans to government agencies, and coordinating until approval is granted — allowing new land titles to be officially issued.",
    details: [
      "Preparation of survey and technical documents",
      "Submission to DENR/LRA for approval",
      "Follow-up and status monitoring",
      "Coordination with LGU and other agencies",
      "Assistance until final approval release",
    ],
    uses: [
      "Subdivision approval",
      "Lot segregation processing",
      "Lot consolidation approval",
      "Title issuance for new lots",
    ],
  },
  {
    slug: "transfer-of-title-tax-declaration",
    name: "Transfer of Title & Tax Declaration",
    short: "Process the legal transfer of land ownership to a new owner.",
    description:
      "We facilitate the transfer of ownership of land by handling both the title transfer and tax declaration update. This ensures that the property is legally recorded under the new owner in both the Registry of Deeds and the local assessor’s office.",
    details: [
      "Preparation and verification of transfer documents",
      "Processing with Registry of Deeds (title transfer)",
      "Updating of tax declaration with local assessor",
      "Coordination with BIR for tax requirements",
      "End-to-end assistance until completion",
    ],
    uses: [
      "Property sale or purchase",
      "Inheritance transfers",
      "Donation of property",
      "Ownership record updates",
    ],
  }

];

export const FACEBOOK_URL = "https://www.facebook.com/RanolaSurveyingPAX";
export const PHONE = "09121181559";
export const EMAIL = "ranolasurveying@gmail.com";
export const ADDRESS = "San Roque St., Poblacion 1, Mobo, Masbate";
