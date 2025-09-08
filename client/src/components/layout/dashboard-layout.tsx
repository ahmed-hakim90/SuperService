import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../../lib/auth";
import Navbar from "./navbar";
import Sidebar from "./sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="loading-spinner"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMobileMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="main-content flex-1 lg:mr-64 p-6 min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </div>
    </div>
  );
}
