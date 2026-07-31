import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { User, Building, IdCard, Lock, FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  password: string;
  department: string;
  isActive: boolean;
  createdAt: string;
  assignedIssues?: any[];
}

interface EmployeeDetailsModalProps {
  employeeId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const EmployeeDetailsModal = ({ employeeId, isOpen, onClose }: EmployeeDetailsModalProps) => {
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    if (!employeeId) return;

    const fetchEmployee = async () => {
      const { data, error } = await supabase
        .from("employee_login")
        .select("*")
        .eq("id", employeeId)
        .single();

      if (error) console.error("❌ Error fetching employee:", error.message);
      else setEmployee(data);
    };

    fetchEmployee();
  }, [employeeId]);

  if (!employee) return null;

  const getDepartmentIcon = (department: string) => {
    const icons: Record<string, string> = {
      roads: "🛣️",
      water: "💧",
      electricity: "⚡",
      sanitation: "🗑️",
    };
    return icons[department] || "📋";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "accent";
      case "in-process":
        return "warning";
      case "pending":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle2;
      case "in-process":
        return Clock;
      case "pending":
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Employee Details</span>
          </DialogTitle>
          <DialogDescription>Complete information overview</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Employee Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{employee.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <div className="flex items-center space-x-1">
                    <span>{getDepartmentIcon(employee.department)}</span>
                    <span className="font-medium capitalize">{employee.department}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <IdCard className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Employee ID</p>
                    <p className="font-medium font-mono">{employee.id}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Password</p>
                    <p className="font-medium font-mono">{'•'.repeat(employee.password.length)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant={employee.isActive ? "accent" : "secondary"}>
                  {employee.isActive ? "Active" : "Inactive"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Created: {new Date(employee.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Assigned Issues ({employee.assignedIssues?.length || 0})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!employee.assignedIssues || employee.assignedIssues.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No issues assigned yet</div>
              ) : (
                <div className="space-y-3">
                  {employee.assignedIssues.map((issue: any, index: number) => {
                    const StatusIcon = getStatusIcon(issue.status);
                    return (
                      <motion.div
                        key={issue.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <StatusIcon className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{issue.title}</p>
                            <p className="text-sm text-muted-foreground">{issue.id}</p>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(issue.status) as any} className="capitalize">
                          {issue.status.replace("-", " ")}
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDetailsModal;
