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
  clientName: string;
  location?: string;
  surveyingDay: string; // ISO
  totalAmount: number;
  paidAmount: number;
  status: SaleStatus;
  checklist: boolean[]; // length === REQUIREMENTS_CHECKLIST.length
  files: SaleFile[];
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
const save = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    if (err instanceof DOMException && (err.name === "QuotaExceededError" || err.code === 22)) {
      throw new Error("Storage full — too many large files. Remove some files or use smaller ones.");
    }
    throw err;
  }
};

export const computeStatus = (total: number, paid: number): SaleStatus => {
  if (paid <= 0) return "Unpaid";
  if (paid >= total) return "Paid";
  return "Down Payment";
};

const uid = () => Math.random().toString(36).slice(2, 11);

// Seed demo data once
const seed = async () => {
  if (load<Sale[]>(SALES_KEY, []).length === 0) {
    const today = new Date();
    // Lazy-load mock images so seeding doesn't block initial render
    const [taxDecl, aerial, sketch, propPhoto] = await Promise.all([
      import("@/assets/mock-tax-declaration.jpg").then((m) => m.default),
      import("@/assets/mock-land-aerial.jpg").then((m) => m.default),
      import("@/assets/mock-lot-sketch.jpg").then((m) => m.default),
      import("@/assets/mock-property-photo.jpg").then((m) => m.default),
    ]);
    const mockFilesA: SaleFile[] = [
      { id: uid(), name: "tax-declaration.jpg", type: "image/jpeg", dataUrl: taxDecl },
      { id: uid(), name: "lot-aerial-view.jpg", type: "image/jpeg", dataUrl: aerial },
    ];
    const mockFilesB: SaleFile[] = [
      { id: uid(), name: "lot-sketch.jpg", type: "image/jpeg", dataUrl: sketch },
      { id: uid(), name: "property-photo.jpg", type: "image/jpeg", dataUrl: propPhoto },
    ];
    const demo: Sale[] = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - i * 7 + 3);
      const total = 15000 + i * 4500;
      const paid = i % 3 === 0 ? total : i % 3 === 1 ? total / 2 : 0;
      return {
        id: uid(),
        clientName: ["Juan Dela Cruz", "Maria Santos", "Pedro Reyes", "Ana Lim", "Jose Cruz", "Liza Tan"][i],
        location: ["Brgy. Nursery, Masbate City", "Brgy. Bayombon, Mobo", "Brgy. Tugbo, Masbate City", "Brgy. Asid, Masbate City", "Brgy. Sawang, Aroroy", "Brgy. Igang, Mobo"][i],
        surveyingDay: d.toISOString(),
        totalAmount: total,
        paidAmount: paid,
        status: computeStatus(total, paid),
        checklist: REQUIREMENTS_CHECKLIST.map((_, k) => k < 3 + (i % 4)),
        files: i === 0 ? mockFilesA : i === 2 ? mockFilesB : [],
        createdAt: new Date(today.getTime() - i * 86400000 * 4).toISOString(),
      };
    });
    save(SALES_KEY, demo);
  }
  if (load<Expense[]>(EXPENSES_KEY, []).length === 0) {
    const today = new Date();
    const demo: Expense[] = [
      { id: uid(), name: "Field crew wages", description: "2-day field work", category: "Labor", amount: 4500, date: new Date(today.getTime() - 86400000 * 2).toISOString() },
      { id: uid(), name: "Office rent", description: "Monthly", category: "Overhead", amount: 8000, date: new Date(today.getTime() - 86400000 * 8).toISOString() },
      { id: uid(), name: "Fuel", description: "Trip to barangay", category: "Transport", amount: 1200, date: new Date(today.getTime() - 86400000 * 5).toISOString() },
      { id: uid(), name: "DENR filing fee", description: "Subdivision plan", category: "Government Fees", amount: 2500, date: new Date(today.getTime() - 86400000 * 14).toISOString() },
      { id: uid(), name: "Plotter ink", description: "Plan printing", category: "Office", amount: 1800, date: new Date(today.getTime() - 86400000 * 20).toISOString() },
    ];
    save(EXPENSES_KEY, demo);
  }
};
seed();

// Sales
export const listSales = (): Sale[] =>
  load<Sale[]>(SALES_KEY, []).sort((a, b) => +new Date(b.surveyingDay) - +new Date(a.surveyingDay));

export const getSale = (id: string) => listSales().find((s) => s.id === id);

export const upsertSale = (sale: Omit<Sale, "id" | "status" | "createdAt"> & { id?: string }) => {
  const all = load<Sale[]>(SALES_KEY, []);
  const status = computeStatus(sale.totalAmount, sale.paidAmount);
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
