import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminSales from "./pages/admin/AdminSales";
import AdminSaleDetail from "./pages/admin/AdminSaleDetail";
import AdminExpenses from "./pages/admin/AdminExpenses";
import AdminReports from "./pages/admin/AdminReports";
import AdminClients from "./pages/admin/AdminClients";
import AdminTeams from "./pages/admin/AdminTeams";
import AdminEquipment from "./pages/admin/AdminEquipment";
import AdminBilling from "./pages/admin/AdminBilling";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
          </Route>

          <Route path="/ranola-admin" element={<AdminLogin />} />
          <Route element={<AdminLayout />}>
            <Route path="/ranola-admin/dashboard" element={<AdminDashboard />} />
            <Route path="/ranola-admin/bookings" element={<AdminBookings />} />
            <Route path="/ranola-admin/sales" element={<AdminSales />} />
            <Route path="/ranola-admin/sales/:id" element={<AdminSaleDetail />} />
            <Route path="/ranola-admin/expenses" element={<AdminExpenses />} />
            <Route path="/ranola-admin/reports" element={<AdminReports />} />
            <Route path="/ranola-admin/clients" element={<AdminClients />} />
            <Route path="/ranola-admin/teams" element={<AdminTeams />} />
            <Route path="/ranola-admin/equipment" element={<AdminEquipment />} />
            <Route path="/ranola-admin/billing" element={<AdminBilling />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;