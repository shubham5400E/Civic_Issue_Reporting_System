import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { UserRole, useStore } from "@/store/useStore";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Login = () => {
  const [searchParams] = useSearchParams();
  const role = (searchParams.get("role") as UserRole) || "employee";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useStore((state) => state.login);
  const navigate = useNavigate();
  // Import supabase client at the top of the file

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const table = role === "admin" ? "admin_login" : "employee_login";
    const { data, error: dbError } = await supabase
      .from(table)
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();
    if (dbError || !data) {
      setError("Invalid email or password.");
      return;
    }
    login(role);
    if (role === "admin") {
      navigate("/admin");
    } else {
      // Store employee email in localStorage for dashboard filtering
      localStorage.setItem("employee_email", email);
      navigate("/employee");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-elevated border-0">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mx-auto mb-4 w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center"
            >
              <Building2 className="w-8 h-8 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Civic Issue Portal
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Login as <span className="font-semibold">{role}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-4">
                <Label htmlFor="email" className="text-base font-medium">
                  Email
                </Label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="password" className="text-base font-medium">
                  Password
                </Label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full font-medium py-6 text-base"
                  variant="gradient"
                  size="lg"
                >
                  Access Dashboard
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
