import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { UserPlus } from "lucide-react";
import { useState } from "react";

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeCreated?: () => void;
}

const CreateEmployeeModal = ({ isOpen, onClose, onEmployeeCreated }: CreateEmployeeModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const departments = [
    { value: "pothole", label: "Pothole" },
    { value: "streetlight", label: "Streetlight" },
    { value: "garbage", label: "Garbage" },
    { value: "water", label: "Water" },
    { value: "electricity", label: "Electricity" },
    { value: "park", label: "Park" },
  ];

  const handleCreate = async () => {
    const { name, email, department, password } = formData;

    if (!name.trim() || !email.trim() || !department || !password.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if email already exists in employees table
      const { data: existing } = await supabase
        .from("employee_login")
        .select("id")
        .eq("email", email)
        .single();

      if (existing) {
        toast({
          title: "Duplicate Email",
          description: "An employee with this email already exists",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Store password as plain text (not recommended for production)
      const { error } = await supabase.from("employee_login").insert([
        {
          name: name.trim(),
          email: email.trim(),
          department,
          password: password,
        },
      ]);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Employee created",
          description: `${name} has been added successfully`,
        });
        setFormData({ name: "", email: "", department: "", password: "" });
        if (onEmployeeCreated) {
          onEmployeeCreated();
        }
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ name: "", email: "", department: "", password: "" });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Create New Employee</span>
          </DialogTitle>
          <DialogDescription>
            Add a new employee to the system
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="Enter employee name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              placeholder="Enter employee email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Select
              value={formData.department}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, department: value }))
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleCreate} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Employee"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEmployeeModal;
