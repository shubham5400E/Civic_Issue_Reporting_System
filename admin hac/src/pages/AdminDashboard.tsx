// Type for employee row returned from Supabase
type EmployeeRow = {
  id: string;
  name: string;
  email: string;
  department: string;
  password: string;
  is_active: boolean;
  employeeId?: string;
  assignedIssues?: string[];
  completedIssues?: string[];
  createdAt?: string;
};
import CreateEmployeeModal from "@/components/CreateEmployeeModal";
import EmployeeDetailsModal from "@/components/EmployeeDetailsModal";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabaseClient";
import { Employee } from "@/store/useStore";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  FileText,
  Search,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
type Issue = {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  reporter: { name: string };
};

const AdminDashboard = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  // const { employees } = useStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  // Fetch employees from Supabase
  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("employee_login")
      .select("id, name, email, department, password, is_active");
    if (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    } else {
      // Map Supabase data to Employee interface
      const mapped = (data || []).map((emp: EmployeeRow) => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.department as
          | "roads"
          | "sanitation"
          | "water"
          | "electricity",
        employeeId: emp.employeeId || "",
        password: emp.password,
        isActive: emp.is_active,
        assignedIssues: emp.assignedIssues || [],
        completedIssues: emp.completedIssues || [],
        createdAt: emp.createdAt || "",
      }));
      setEmployees(mapped);
    }
  };
  useEffect(() => {
    fetchEmployees();
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateEmployee, setShowCreateEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"issues" | "employees">("issues");

  useEffect(() => {
    const fetchIssues = async () => {
      const { data, error } = await supabase
        .from("issues")
        .select(
          "issue_id, issue_title, issue_category, priority, status, name"
        );
      if (error) {
        console.error("Error fetching issues:", error);
        setIssues([]);
        setFilteredIssues([]);
      } else {
        const mapped = (data || []).map(
          (issue): Issue => ({
            id: issue.issue_id,
            title: issue.issue_title,
            category: issue.issue_category,
            priority: issue.priority,
            status: issue.status,
            reporter: { name: issue.name || "Unknown" },
          })
        );
        setIssues(mapped);
        setFilteredIssues(mapped);
      }
    };
    fetchIssues();
  }, []);

  const stats = {
    total: issues.length,
    pending: issues.filter((i) => i.status === "pending").length,
    inProcess: issues.filter((i) => i.status === "in-process").length,
    completed: issues.filter((i) => i.status === "completed").length,
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      const filtered = issues.filter(
        (i) =>
          i.title.toLowerCase().includes(value.toLowerCase()) ||
          i.category.toLowerCase().includes(value.toLowerCase()) ||
          i.status.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredIssues(filtered);
    } else {
      setFilteredIssues(issues);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
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

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this issue?")) {
      // Optionally, delete from Supabase here
      setIssues((prev) => prev.filter((issue) => issue.id !== id));
      setFilteredIssues((prev) => prev.filter((issue) => issue.id !== id));
    }
  };

  const getDepartmentIcon = (department: string) => {
    const icons: Record<string, string> = {
      roads: "🛣",
      water: "💧",
      electricity: "⚡",
      sanitation: "🗑",
    };
    return icons[department] || "📋";
  };

  return (
    <DashboardLayout
      title="Administrative Dashboard"
      description="Manage and oversee all civic issues"
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-card border-0 hover:shadow-elevated transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Issues
              </CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.total}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-card border-0 hover:shadow-elevated transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.pending}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-card border-0 hover:shadow-elevated transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Process
              </CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.inProcess}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-card border-0 hover:shadow-elevated transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.completed}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("issues")}
            className={`px-4 py-2 rounded-md transition-all ${
              activeTab === "issues"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Issues
          </button>
          <button
            onClick={() => setActiveTab("employees")}
            className={`px-4 py-2 rounded-md transition-all ${
              activeTab === "employees"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Employees
          </button>
        </div>

        {activeTab === "employees" && (
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setShowCreateEmployee(true)}
              className="flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Employee</span>
            </Button>
          </motion.div>
        )}
      </div>

      {/* Issues Table */}
      {activeTab === "issues" && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="shadow-card border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Issues</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search issues..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIssues.map((issue, index) => (
                      <motion.tr
                        key={issue.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-mono text-sm">
                          {issue.id}
                        </TableCell>
                        <TableCell className="font-medium max-w-xs truncate">
                          {issue.title}
                        </TableCell>
                        <TableCell className="capitalize">
                          {issue.category}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getPriorityColor(issue.priority)}
                            className="capitalize"
                          >
                            {issue.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusColor(issue.status)}
                            className="capitalize"
                          >
                            {issue.status.replace("-", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{issue.reporter.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(issue.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Employees Grid */}
      {activeTab === "employees" && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Employee Management</span>
                <Badge variant="secondary" className="ml-2">
                  {employees.length} Total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {employees.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No employees yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first employee to get started
                  </p>
                  <Button onClick={() => setShowCreateEmployee(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Employee
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employees.map((employee, index) => (
                    <motion.div
                      key={employee.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="cursor-pointer"
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      <Card className="hover:shadow-elevated transition-all duration-300">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">
                                {getDepartmentIcon(employee.department)}
                              </span>
                              <div>
                                <CardTitle className="text-base">
                                  {employee.name}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {employee.department}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant={
                                employee.isActive ? "accent" : "secondary"
                              }
                              className="text-xs"
                            >
                              {employee.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Email:
                            </span>
                            <span className="font-mono"></span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Department:
                            </span>
                            <span className="capitalize">
                              {employee.department}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Password:
                            </span>
                            <span className="font-mono">
                              {employee.password}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Modals */}
      <CreateEmployeeModal
        isOpen={showCreateEmployee}
        onClose={() => setShowCreateEmployee(false)}
        onEmployeeCreated={fetchEmployees}
      />

      <EmployeeDetailsModal
        employeeId={selectedEmployee?.id ?? null}
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />
    </DashboardLayout>
  );
};

export default AdminDashboard;
