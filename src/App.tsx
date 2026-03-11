import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CustomerDataProvider } from "@/context/CustomerDataContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CustomersPage from "./pages/CustomersPage";
import CustomerStatsPage from "./pages/CustomerStatsPage";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import CustomerEditPage from "./pages/CustomerEditPage";
import SchedulePage from "./pages/SchedulePage";
import CandidateDatabasePage from "./pages/CandidateDatabasePage";
import CandidateDetailPage from "./pages/CandidateDetailPage";
import MyCandidatesPage from "./pages/MyCandidatesPage";
import CandidateManagementPage from "./pages/CandidateManagementPage";
import ProcessesPage from "./pages/ProcessesPage";
import OpenJobsPage from "./pages/OpenJobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import CandidateApplyPage from "./pages/CandidateApplyPage";
import AccountingDataPage from "./pages/AccountingDataPage";
import AccountingDebtPage from "./pages/AccountingDebtPage";
import AccountingDashboardPage from "./pages/AccountingDashboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CustomerDataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/candidate-management" element={<CandidateManagementPage />} />
              <Route path="/bd-crm/customers" element={<CustomersPage />} />
              <Route path="/bd-crm/stats" element={<CustomerStatsPage />} />
              <Route path="/bd-crm/schedule" element={<SchedulePage />} />
              <Route path="/bd-crm/customers/:id" element={<CustomerDetailPage />} />
              <Route path="/bd-crm/customers/:id/edit" element={<CustomerEditPage />} />
              <Route path="/candidates/database" element={<CandidateDatabasePage />} />
              <Route path="/candidates/database/:id" element={<CandidateDetailPage />} />
              <Route path="/candidates/my" element={<MyCandidatesPage />} />
              <Route path="/processes" element={<ProcessesPage />} />
              {/* Jobs Module */}
              <Route path="/jobs/open" element={<OpenJobsPage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />
              {/* Sales / Accounting */}
              <Route path="/sales/data" element={<AccountingDataPage />} />
              <Route path="/sales/debt" element={<AccountingDebtPage />} />
              <Route path="/sales/dashboard" element={<AccountingDashboardPage />} />
              {/* Candidate Apply Page (Public) */}
              <Route path="/apply/:headhunterSlug/:jobCode" element={<CandidateApplyPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CustomerDataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
