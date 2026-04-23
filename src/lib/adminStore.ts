/**
 * Mock data store for /ranola-admin.
 * Persists to localStorage. Replace with real backend when ready.
 */

export type SaleStatus = "Unpaid" | "Down Payment" | "Paid";

export type SaleFile = {
  id: string;
  name: string;
  type: string;
  dataUrl: string;
};

export const REQUIREMENTS_CHECKLIST = [
  "Latest Tax Declaration (Certified True Copy)",
  "Proof of Deed (Donation / Sale / Extra Judicial Settlement) — photocopy + original",
  "Certification of Land Status (CENRO) — present tax declaration and map",
  "Certification from Regional Trial Court (RTC) — no pending land registration case",
  "Certification from Barangay — no record of claims and conflict (1 original, 1 duplicate)",
  "Land Registration Authority (LRA/ROD Masbate) Lot Status (1 original)",
  "Lot Status & Survey Authority from DENR (form to be signed and submitted)",
  "Notice for adjoining owner and chairman of barangay",
  "Certificate of Occupancy (from barangay if no legal documents)",
];

export type Sale = {
  id: string;
  clientId: string;
  clientName: string;
  location?: string;
  surveyingDay: string;
  totalAmount: number;
  status: SaleStatus;
  surveyType: SurveyType;
  assignedTeamId?: string;
  checklist: boolean[];
  files: SaleFile[];
  remarks?: string;
  createdAt: string;
};

export type Expense = {
  id: string;
  name: string;
  description: string;
  category: string;
  amount: number;
  date: string; // ISO
};

export const EXPENSE_CATEGORIES = ["Labor", "Overhead", "Equipment", "Transport", "Office", "Government Fees", "Other"];

const SALES_KEY = "ranola_sales_v2";
const EXPENSES_KEY = "ranola_expenses_v1";
const CLIENTS_KEY = "ranola_clients_v1";
const PROJECTS_KEY = "ranola_projects_v1";
const TEAMS_KEY = "ranola_teams_v1";
const EQUIPMENT_KEY = "ranola_equipment_v1";
const INVOICES_KEY = "ranola_invoices_v1";
const AUTH_KEY = "ranola_admin_auth";
const USERS_KEY = "ranola_admin_users";

export type AdminUser = { email: string; password: string; name: string };

const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const isQuotaError = (err: unknown) =>
  err instanceof DOMException &&
  (err.name === "QuotaExceededError" ||
    err.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    err.code === 22 ||
    err.code === 1014);

const save = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    if (isQuotaError(err)) {
      // Try to free space by stripping seeded mock files from existing sales,
      // then retry once before surfacing an error.
      try {
        const sales = JSON.parse(localStorage.getItem(SALES_KEY) || "[]") as Sale[];
        const trimmed = sales.map((s) => ({ ...s, files: [] }));
        localStorage.setItem(SALES_KEY, JSON.stringify(trimmed));
        localStorage.setItem(key, JSON.stringify(value));
        return;
      } catch {
        /* fall through */
      }
      throw new Error(
        "Browser storage is full. This demo stores files in your browser only — please remove some existing file attachments and try again."
      );
    }
    throw err;
  }
};

export const computeStatus = (total: number, paid: number): SaleStatus => {
  if (paid <= 0) return "Unpaid";
  if (paid >= total) return "Paid";
  return "Down Payment";
};

export const getSaleStatusFromInvoice = (saleId: string, amount: number): SaleStatus => {
  const invoices = listInvoices().filter(inv => inv.saleId === saleId);
  if (invoices.length === 0) return "Unpaid";
  const latestInvoice = invoices[0];
  const totalPaid = latestInvoice.payments.reduce((sum, p) => sum + p.amount, 0);
  return computeStatus(amount, totalPaid);
};

export const getInvoiceForSale = (saleId: string): Invoice | null => {
  return listInvoices().find(inv => inv.saleId === saleId) ?? null;
};

const uid = () => Math.random().toString(36).slice(2, 11);

// Seed demo data once
const seed = async () => {
  if (load<Client[]>(CLIENTS_KEY, []).length > 0) return;

  const today = new Date();

  // Lazy-load mock images so seeding doesn't block initial render
  const [taxDecl, aerial, sketch, propPhoto] = await Promise.all([
    import("@/assets/mock-tax-declaration.jpg").then((m) => m.default),
    import("@/assets/mock-land-aerial.jpg").then((m) => m.default),
    import("@/assets/mock-lot-sketch.jpg").then((m) => m.default),
    import("@/assets/mock-property-photo.jpg").then((m) => m.default),
  ]);

  // Clients
  const client1Id = uid();
  const client2Id = uid();
  const demoClients: Client[] = [
    { id: client1Id, name: "Juan Dela Cruz", email: "juan.delacruz@email.com", phone: "0917 123 4567", address: "Brgy. Nursery, Masbate City", createdAt: new Date(today.getTime() - 86400000 * 30).toISOString() },
    { id: client2Id, name: "Maria Santos", email: "maria.santos@email.com", phone: "0928 234 5678", address: "Brgy. Bayombon, Mobo, Masbate", createdAt: new Date(today.getTime() - 86400000 * 25).toISOString() },
  ];
  save(CLIENTS_KEY, demoClients);

  // Teams
  const team1Id = uid();
  const team2Id = uid();
  const demoTeams: Team[] = [
    { id: team1Id, name: "Team Alpha", leaderId: uid(), members: [
      { id: uid(), name: "Roberto Rañola", role: "Party Chief", phone: "0919 111 1111" },
      { id: uid(), name: "Carlos Cruz", role: "Instrumentman" },
      { id: uid(), name: "Miguel Torres", role: "Rodman" },
    ], status: "Available", createdAt: new Date(today.getTime() - 86400000 * 60).toISOString() },
    { id: team2Id, name: "Team Bravo", leaderId: uid(), members: [
      { id: uid(), name: "Fernando Reyes", role: "Party Chief", phone: "0920 222 2222" },
      { id: uid(), name: "Adrian Mercado", role: "Instrumentman" },
      { id: uid(), name: "Rico Aquino", role: "Helper" },
    ], status: "Deployed", createdAt: new Date(today.getTime() - 86400000 * 45).toISOString() },
  ];
  save(TEAMS_KEY, demoTeams);

  // Equipment
  const demoEquipment: Equipment[] = [
    { id: uid(), name: "Trimble GPS R12", type: "GPS", serialNumber: "TRM-R12-2023-001", condition: "Good", assignedTeamId: team1Id, lastCalibration: new Date(today.getTime() - 86400000 * 30).toISOString(), maintenanceLogs: [], createdAt: new Date(today.getTime() - 86400000 * 120).toISOString() },
    { id: uid(), name: "Leica TS16 Total Station", type: "Total Station", serialNumber: "LCA-TS16-2022-005", condition: "Good", assignedTeamId: team2Id, lastCalibration: new Date(today.getTime() - 86400000 * 15).toISOString(), maintenanceLogs: [], createdAt: new Date(today.getTime() - 86400000 * 100).toISOString() },
  ];
  save(EQUIPMENT_KEY, demoEquipment);

  // Sales with invoices
  const sale1Id = uid();
  const sale2Id = uid();
  const mockFiles1: SaleFile[] = [
    { id: uid(), name: "tax-declaration.jpg", type: "image/jpeg", dataUrl: taxDecl },
    { id: uid(), name: "lot-aerial-view.jpg", type: "image/jpeg", dataUrl: aerial },
  ];
  const mockFiles2: SaleFile[] = [
    { id: uid(), name: "lot-sketch.jpg", type: "image/jpeg", dataUrl: sketch },
    { id: uid(), name: "property-photo.jpg", type: "image/jpeg", dataUrl: propPhoto },
  ];

  const demoSales: Sale[] = [
    {
      id: sale1Id,
      clientId: client1Id,
      clientName: "Juan Dela Cruz",
      location: "Brgy. Nursery, Masbate City",
      surveyingDay: new Date(today.getTime() - 86400000 * 5).toISOString(),
      totalAmount: 25000,
      status: "Partial",
      surveyType: "Relocation Survey",
      assignedTeamId: team1Id,
      checklist: [true, true, true, true],
      files: mockFiles1,
      createdAt: new Date(today.getTime() - 86400000 * 10).toISOString(),
    },
    {
      id: sale2Id,
      clientId: client2Id,
      clientName: "Maria Santos",
      location: "Brgy. Bayombon, Mobo, Masbate",
      surveyingDay: new Date(today.getTime() - 86400000 * 12).toISOString(),
      totalAmount: 35000,
      status: "Paid",
      surveyType: "Subdivision",
      assignedTeamId: team2Id,
      checklist: [true, true, true, true, true],
      files: mockFiles2,
      createdAt: new Date(today.getTime() - 86400000 * 18).toISOString(),
    },
  ];
  save(SALES_KEY, demoSales);

  // Invoices for each sale
  const inv1Payment1Id = uid();
  const inv2Payment1Id = uid();
  const inv2Payment2Id = uid();
  const demoInvoices: Invoice[] = [
    {
      id: uid(),
      invoiceNumber: "INV-2026-001",
      clientId: client1Id,
      saleId: sale1Id,
      amount: 25000,
      dueDate: new Date(today.getTime() + 86400000 * 15).toISOString(),
      payments: [
        { id: inv1Payment1Id, date: new Date(today.getTime() - 86400000 * 2).toISOString(), amount: 10000, method: "Cash", reference: undefined, notes: "Down payment" },
      ],
      status: "Partial",
      createdAt: new Date(today.getTime() - 86400000 * 10).toISOString(),
    },
    {
      id: uid(),
      invoiceNumber: "INV-2026-002",
      clientId: client2Id,
      saleId: sale2Id,
      amount: 35000,
      dueDate: new Date(today.getTime() + 86400000 * 7).toISOString(),
      payments: [
        { id: inv2Payment1Id, date: new Date(today.getTime() - 86400000 * 8).toISOString(), amount: 20000, method: "Bank Transfer", reference: "BT-2026-0401" },
        { id: inv2Payment2Id, date: new Date(today.getTime() - 86400000 * 1).toISOString(), amount: 15000, method: "GCash", reference: "GC-2026-0415" },
      ],
      status: "Paid",
      createdAt: new Date(today.getTime() - 86400000 * 18).toISOString(),
    },
  ];
  save(INVOICES_KEY, demoInvoices);

  // Expenses - ensure profit is higher than total expense
  // Sale 1: Paid 10000, Sale 2: Paid 35000 = Total Revenue 45000
  // Let's keep expenses under 15000 so profit is positive
  const demoExpenses: Expense[] = [
    { id: uid(), name: "Field crew wages", description: "2-day field work for subdivision survey", category: "Labor", amount: 6000, date: new Date(today.getTime() - 86400000 * 2).toISOString() },
    { id: uid(), name: "Fuel and transport", description: "Trip to Masbate City and back", category: "Transport", amount: 3500, date: new Date(today.getTime() - 86400000 * 3).toISOString() },
  ];
  save(EXPENSES_KEY, demoExpenses);
};
seed();

// Sales
export const listSales = (): Sale[] =>
  load<Sale[]>(SALES_KEY, []).sort((a, b) => +new Date(b.surveyingDay) - +new Date(a.surveyingDay));

export const getSale = (id: string) => listSales().find((s) => s.id === id);

export const upsertSale = (sale: Omit<Sale, "id" | "status" | "createdAt"> & { id?: string }) => {
  const all = load<Sale[]>(SALES_KEY, []);
  const status = getSaleStatusFromInvoice(sale.id ?? "", sale.totalAmount);
  if (sale.id) {
    const idx = all.findIndex((s) => s.id === sale.id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...sale, status, id: sale.id };
    }
  } else {
    all.push({ ...sale, id: uid(), status, createdAt: new Date().toISOString() });
  }
  save(SALES_KEY, all);
};

export const deleteSale = (id: string) => {
  save(SALES_KEY, load<Sale[]>(SALES_KEY, []).filter((s) => s.id !== id));
  save(INVOICES_KEY, load<Invoice[]>(INVOICES_KEY, []).filter((inv) => inv.saleId !== id));
};

// Expenses
export const listExpenses = (): Expense[] =>
  load<Expense[]>(EXPENSES_KEY, []).sort((a, b) => +new Date(b.date) - +new Date(a.date));

export const upsertExpense = (e: Omit<Expense, "id"> & { id?: string }) => {
  const all = load<Expense[]>(EXPENSES_KEY, []);
  if (e.id) {
    const idx = all.findIndex((x) => x.id === e.id);
    if (idx >= 0) all[idx] = { ...all[idx], ...e, id: e.id };
  } else {
    all.push({ ...e, id: uid() });
  }
  save(EXPENSES_KEY, all);
};

export const deleteExpense = (id: string) => {
  save(EXPENSES_KEY, load<Expense[]>(EXPENSES_KEY, []).filter((e) => e.id !== id));
};

// Clients
export type Client = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tin?: string;
  notes?: string;
  createdAt: string;
};

export const listClients = (): Client[] =>
  load<Client[]>(CLIENTS_KEY, []).sort((a, b) => a.name.localeCompare(b.name));

export const getClient = (id: string) => listClients().find((c) => c.id === id);

export const upsertClient = (c: Omit<Client, "id" | "createdAt"> & { id?: string }) => {
  const all = load<Client[]>(CLIENTS_KEY, []);
  if (c.id) {
    const idx = all.findIndex((x) => x.id === c.id);
    if (idx >= 0) all[idx] = { ...all[idx], ...c };
  } else {
    all.push({ ...c, id: uid(), createdAt: new Date().toISOString() });
  }
  save(CLIENTS_KEY, all);
};

export const deleteClient = (id: string) => {
  save(CLIENTS_KEY, load<Client[]>(CLIENTS_KEY, []).filter((c) => c.id !== id));
};

// Projects
export type SurveyType =
  | "Relocation Survey"
  | "Subdivision"
  | "Topographic"
  | "Boundary"
  | "Construction"
  | "Other";

export type ProjectStatus = "Pending" | "On-Site" | "Completed";

export type Project = {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  location: string;
  surveyType: SurveyType;
  status: ProjectStatus;
  assignedTeamId?: string;
  surveyingDate: string;
  deadline?: string;
  totalAmount: number;
  paidAmount: number;
  checklist: boolean[];
  files: SaleFile[];
  remarks?: string;
  createdAt: string;
};

export const listProjects = (): Project[] =>
  load<Project[]>(PROJECTS_KEY, []).sort((a, b) => +new Date(b.surveyingDate) - +new Date(a.surveyingDate));

export const getProject = (id: string) => listProjects().find((p) => p.id === id);

export const upsertProject = (p: Omit<Project, "id" | "createdAt"> & { id?: string }) => {
  const all = load<Project[]>(PROJECTS_KEY, []);
  if (p.id) {
    const idx = all.findIndex((x) => x.id === p.id);
    if (idx >= 0) all[idx] = { ...all[idx], ...p };
  } else {
    all.push({ ...p, id: uid(), createdAt: new Date().toISOString() });
  }
  save(PROJECTS_KEY, all);
};

export const deleteProject = (id: string) => {
  save(PROJECTS_KEY, load<Project[]>(PROJECTS_KEY, []).filter((p) => p.id !== id));
};

// Teams
export type TeamMemberRole = "Party Chief" | "Instrumentman" | "Rodman" | "Helper" | "Other";

export type TeamMember = {
  id: string;
  name: string;
  role: TeamMemberRole;
  phone?: string;
};

export type TeamStatus = "Available" | "Deployed" | "Offline";

export type Team = {
  id: string;
  name: string;
  leaderId: string;
  members: TeamMember[];
  status: TeamStatus;
  notes?: string;
  createdAt: string;
};

export const listTeams = (): Team[] =>
  load<Team[]>(TEAMS_KEY, []).sort((a, b) => a.name.localeCompare(b.name));

export const getTeam = (id: string) => listTeams().find((t) => t.id === id);

export const upsertTeam = (t: Omit<Team, "id" | "createdAt"> & { id?: string }) => {
  const all = load<Team[]>(TEAMS_KEY, []);
  if (t.id) {
    const idx = all.findIndex((x) => x.id === t.id);
    if (idx >= 0) all[idx] = { ...all[idx], ...t };
  } else {
    all.push({ ...t, id: uid(), createdAt: new Date().toISOString() });
  }
  save(TEAMS_KEY, all);
};

export const deleteTeam = (id: string) => {
  save(TEAMS_KEY, load<Team[]>(TEAMS_KEY, []).filter((t) => t.id !== id));
};

// Equipment
export type EquipmentType = "GPS" | "Total Station" | "Theodolite" | "Level" | "Drone" | "Other";

export type EquipmentCondition = "Good" | "Needs Maintenance" | "Out of Service";

export type MaintenanceLog = {
  id: string;
  date: string;
  description: string;
  cost?: number;
};

export type Equipment = {
  id: string;
  name: string;
  type: EquipmentType;
  serialNumber?: string;
  condition: EquipmentCondition;
  assignedTeamId?: string;
  lastCalibration?: string;
  maintenanceLogs: MaintenanceLog[];
  notes?: string;
  createdAt: string;
};

export const listEquipment = (): Equipment[] =>
  load<Equipment[]>(EQUIPMENT_KEY, []).sort((a, b) => a.name.localeCompare(b.name));

export const getEquipment = (id: string) => listEquipment().find((e) => e.id === id);

export const upsertEquipment = (e: Omit<Equipment, "id" | "createdAt"> & { id?: string }) => {
  const all = load<Equipment[]>(EQUIPMENT_KEY, []);
  if (e.id) {
    const idx = all.findIndex((x) => x.id === e.id);
    if (idx >= 0) all[idx] = { ...all[idx], ...e };
  } else {
    all.push({ ...e, id: uid(), createdAt: new Date().toISOString() });
  }
  save(EQUIPMENT_KEY, all);
};

export const deleteEquipment = (id: string) => {
  save(EQUIPMENT_KEY, load<Equipment[]>(EQUIPMENT_KEY, []).filter((e) => e.id !== id));
};

// Invoices
export type PaymentMethod = "Cash" | "Bank Transfer" | "GCash" | "Check" | "Other";

export type Payment = {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
};

export type InvoiceStatus = "Unpaid" | "Partial" | "Paid" | "Overdue";

export type Invoice = {
  id: string;
  invoiceNumber: string;
  clientId: string;
  saleId: string;
  amount: number;
  dueDate?: string;
  payments: Payment[];
  status: InvoiceStatus;
  notes?: string;
  createdAt: string;
};

const getNextInvoiceNumber = (): string => {
  const all = load<Invoice[]>(INVOICES_KEY, []);
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const existing = all
    .map((inv) => {
      const num = inv.invoiceNumber.replace(prefix, "");
      return parseInt(num, 10) || 0;
    })
    .filter(Boolean);
  const next = existing.length === 0 ? 1 : Math.max(...existing) + 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
};

export const computeInvoiceStatus = (amount: number, payments: Payment[]): InvoiceStatus => {
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  if (totalPaid <= 0) return "Unpaid";
  if (totalPaid >= amount) return "Paid";
  return "Partial";
};

export const listInvoices = (): Invoice[] =>
  load<Invoice[]>(INVOICES_KEY, []).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

export const getInvoice = (id: string) => listInvoices().find((inv) => inv.id === id);

export const upsertInvoice = (inv: Omit<Invoice, "id" | "invoiceNumber" | "status" | "createdAt"> & { id?: string }) => {
  const all = load<Invoice[]>(INVOICES_KEY, []);
  const status = computeInvoiceStatus(inv.amount, inv.payments);
  if (inv.id) {
    const idx = all.findIndex((x) => x.id === inv.id);
    if (idx >= 0) all[idx] = { ...all[idx], ...inv, status };
  } else {
    all.push({
      ...inv,
      id: uid(),
      invoiceNumber: getNextInvoiceNumber(),
      status,
      createdAt: new Date().toISOString(),
    });
  }
  save(INVOICES_KEY, all);
};

export const deleteInvoice = (id: string) => {
  save(INVOICES_KEY, load<Invoice[]>(INVOICES_KEY, []).filter((inv) => inv.id !== id));
};

// Auth
export const DEFAULT_ADMIN: AdminUser = { email: "admin@ranola.ph", password: "ranola123", name: "Rañola Admin" };
export const getUsers = (): AdminUser[] => {
  const users = load<AdminUser[]>(USERS_KEY, []);
  if (!users.some((u) => u.email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase())) {
    users.push(DEFAULT_ADMIN);
    save(USERS_KEY, users);
  }
  return users;
};
export const registerUser = (u: AdminUser) => {
  const users = getUsers();
  if (users.some((x) => x.email.toLowerCase() === u.email.toLowerCase())) {
    throw new Error("An account with this email already exists.");
  }
  users.push(u);
  save(USERS_KEY, users);
};
export const signIn = (email: string, password: string) => {
  const u = getUsers().find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
  if (!u) throw new Error("Invalid email or password.");
  save(AUTH_KEY, { email: u.email, name: u.name, at: Date.now() });
  return u;
};
export const signOut = () => localStorage.removeItem(AUTH_KEY);
export const currentUser = (): { email: string; name: string } | null =>
  load<{ email: string; name: string } | null>(AUTH_KEY, null);
