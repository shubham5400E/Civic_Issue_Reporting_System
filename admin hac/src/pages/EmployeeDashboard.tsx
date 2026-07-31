import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Calendar, User, Filter, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Issue = {
  issue_id: string;
  name: string;
  issue_title: string;
  description: string;
  location: string;
  issue_category: string;
  priority: string;
  status: string;
  created_at: string;
};

const EmployeeDashboard = () => {
  const navigate = useNavigate();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  // Removed category filter
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [employeeDepartment, setEmployeeDepartment] = useState<string>("");

  // ✅ Fetch issues from Supabase
  useEffect(() => {
    // Replace with actual logic to get current employee email
    const currentEmployeeEmail = localStorage.getItem("employee_email") || "";
    console.log("Current Employee Email:", currentEmployeeEmail);

    const fetchEmployeeDepartment = async () => {
      if (!currentEmployeeEmail) return;
      const { data, error } = await supabase
        .from("employee_login")
        .select("department")
        .eq("email", currentEmployeeEmail)
        .single();
      if (error) {
        console.error("Error fetching employee department:", error);
      } else if (data) {
        setEmployeeDepartment(data.department);
      }
    };

    fetchEmployeeDepartment();
  }, []);

  useEffect(() => {
    const fetchIssues = async () => {
      if (!employeeDepartment) return;
      const { data, error } = await supabase
        .from("issues")
        .select("issue_id, name, issue_title, description, location, issue_category, priority, status, created_at")
        .eq("issue_category", employeeDepartment)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching issues:", error);
      } else {
        console.log("Fetched issues from Supabase:", data);
        setIssues(data || []);
        setFilteredIssues(data || []);
      }
    };
    fetchIssues();
  }, [employeeDepartment]);

  // ✅ Apply filters
  useEffect(() => {
    let results = [...issues];

    if (searchTerm.trim() !== "") {
      results = results.filter(
        (issue) =>
          issue.issue_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedPriority !== "all") {
      results = results.filter((issue) => issue.priority === selectedPriority);
    }

    setFilteredIssues(results);
    setHasActiveFilters(
      searchTerm.trim() !== "" || selectedPriority !== "all"
    );
  }, [searchTerm, selectedPriority, issues]);

  // ✅ Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedPriority("all");
    setFilteredIssues(issues);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-accent text-accent-foreground";
      case "in-process":
        return "bg-warning text-warning-foreground";
      case "pending":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      road: "🛣️",
      water: "💧",
      electricity: "⚡",
      sanitation: "🗑️",
      lighting: "💡",
      traffic: "🚦",
    };
    return icons[category] || "📋";
  };

  return (
    <DashboardLayout title="Issue Dashboard" description="View and manage civic issues in your area">
      {/* Filters */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filter Issues</span>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="ml-auto text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by title, description, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedPriority} onValueChange={(value: string) => setSelectedPriority(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIssues.map((issue, index) => {
          console.log("Issue for navigation:", issue);
          return (
          <motion.div
            key={issue.created_at + index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="group"
          >
            <Card
              className="shadow-card border-0 hover:shadow-elevated transition-all duration-300 cursor-pointer h-full"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getCategoryIcon(issue.issue_category)}</span>
                    <Badge variant="outline" className="text-xs">
                      {issue.name}
                    </Badge>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Badge className={`text-xs ${getPriorityColor(issue.priority)}`}>
                      {issue.priority.toUpperCase()}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(issue.status)}`}>
                      {issue.status.replace("-", " ").toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {issue.issue_title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm line-clamp-2">{issue.description}</p>

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{issue.location}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{issue.name || "Anonymous"}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-4"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/issue/${encodeURIComponent(issue.issue_id)}`);
                  }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </motion.div>
  );
  })}
      </div>

      {filteredIssues.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No issues found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
        </motion.div>
      )}
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
