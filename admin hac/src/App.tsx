import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import IssueDetails from "./pages/IssueDetails";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import RoleSelection from "./pages/RoleSelection";
import { useStore } from "./store/useStore";
// ProtectedRoute component
const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: "admin" | "employee";
}) => {
  const currentUser = useStore((state) => state.currentUser);
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  if (requiredRole && currentUser.role !== requiredRole) {
    return (
      <Navigate
        to={currentUser.role === "admin" ? "/admin" : "/employee"}
        replace
      />
    );
  }
  return <>{children}</>;
};
type Issue = {
  issue_id: string;
  issue_title: string;
  status: string;
  // Add other fields as needed from your Supabase 'issues' table
};

const queryClient = new QueryClient();

const App = () => {
  const { currentUser, isAuthenticated } = useStore();

  // ✅ Supabase test state
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    const fetchIssues = async () => {
      const { data, error } = await supabase
        .from("issues")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Supabase error:", error.message);
      } else {
        console.log("✅ Issues fetched:", data);
        setIssues(data || []);
      }
    };

    fetchIssues();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RoleSelection />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee"
              element={
                <ProtectedRoute requiredRole="employee">
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/issue/:id"
              element={
                <ProtectedRoute>
                  <IssueDetails />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
