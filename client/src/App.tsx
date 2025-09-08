import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./lib/auth";
import { ThemeProvider } from "./components/theme-provider";
import LoginPage from "./components/auth/login-page";
import SignupPage from "./components/auth/signup-page";
import WaitingPage from "./components/auth/waiting-page";
import DashboardLayout from "./components/layout/dashboard-layout";
import Dashboard from "./pages/dashboard";
import Users from "./pages/users";
import ServiceRequests from "./pages/service-requests";
import Centers from "./pages/centers";
import Warehouses from "./pages/warehouses";
import Customers from "./pages/customers";
import Categories from "./pages/categories";
import Transfers from "./pages/transfers";
import Reports from "./pages/reports";
import Activities from "./pages/activities";
import Roles from "./pages/roles";
import Settings from "./pages/settings";
import NotFound from "@/pages/not-found";


function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/waiting" component={WaitingPage} />
      
      <Route path="/dashboard">
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </Route>
      
      <Route path="/dashboard/users">
        <DashboardLayout>
          <Users />
        </DashboardLayout>
      </Route>
      
      <Route path="/dashboard/service-requests">
        <DashboardLayout>
          <ServiceRequests />
        </DashboardLayout>
      </Route>
      
      <Route path="/dashboard/centers">
        <DashboardLayout>
          <Centers />
        </DashboardLayout>
      </Route>
      
      <Route path="/dashboard/warehouses">
        <DashboardLayout>
          <Warehouses />
        </DashboardLayout>
      </Route>
      
      <Route path="/dashboard/customers">
        <DashboardLayout>
          <Customers />
        </DashboardLayout>
      </Route>
      
      <Route path="/dashboard/categories">
        <DashboardLayout>
          <Categories />
        </DashboardLayout>
      </Route>
      
      <Route path="/dashboard/transfers">
        <DashboardLayout>
          <Transfers />
        </DashboardLayout>
      </Route>
      
      <Route path="/dashboard/reports">
        <DashboardLayout>
          <Reports />
        </DashboardLayout>
      </Route>
      
      <Route path="/dashboard/activities">
        <DashboardLayout>
          <Activities />
        </DashboardLayout>
      </Route>
      
      <Route path="/dashboard/roles">
        <DashboardLayout>
          <Roles />
        </DashboardLayout>
      </Route>
      
      <Route path="/dashboard/settings">
        <DashboardLayout>
          <Settings />
        </DashboardLayout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
