import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  is_active: boolean;
  created_at: string;
}

const EmployeeList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const departments = [
    { value: "", label: "All Departments" },
    { value: "roads", label: "Roads" },
    { value: "sanitation", label: "Sanitation" },
    { value: "water", label: "Water" },
    { value: "electricity", label: "Electricity" }
  ];

  const fetchEmployees = async () => {
    setLoading(true);
    let query = supabase.from("employee_login").select("*");

    if (departmentFilter) {
      query = query.eq("department", departmentFilter);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      toast({
        title: "Error fetching employees",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setEmployees(data || []);
    }
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    const { error } = await supabase
      .from("employee_login")
      .update({ is_active: !isActive })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status updated",
        description: `Employee has been ${!isActive ? "activated" : "deactivated"}`,
      });
      fetchEmployees();
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [departmentFilter]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Employee List</h2>

      <div className="flex items-center mb-4 space-x-4">
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.value} value={dept.value}>
                {dept.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={fetchEmployees}>Refresh</Button>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Department</th>
            <th className="border p-2">Active</th>
            <th className="border p-2">Created At</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.length === 0 && !loading && (
            <tr>
              <td colSpan={6} className="text-center p-4">
                No employees found
              </td>
            </tr>
          )}
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td className="border p-2">{emp.name}</td>
              <td className="border p-2">{emp.email}</td>
              <td className="border p-2">{emp.department}</td>
              <td className="border p-2">{emp.is_active ? "Yes" : "No"}</td>
              <td className="border p-2">{new Date(emp.created_at).toLocaleString()}</td>
              <td className="border p-2">
                <Button size="sm" onClick={() => toggleActive(emp.id, emp.is_active)}>
                  {emp.is_active ? "Deactivate" : "Activate"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;
