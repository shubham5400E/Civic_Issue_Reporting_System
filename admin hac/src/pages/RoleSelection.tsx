import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserRole } from "@/store/useStore";
import { motion } from "framer-motion";
import { Building2, Shield, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("employee");
  const navigate = useNavigate();

  const handleRoleSelect = () => {
    navigate(`/login?role=${selectedRole}`);
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
              Select Your Role
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Choose your access level to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Access Level</Label>
              <RadioGroup
                value={selectedRole}
                onValueChange={(value: UserRole) => setSelectedRole(value)}
                className="space-y-3"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedRole === "employee"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedRole("employee")}
                >
                  <RadioGroupItem value="employee" id="employee" />
                  <User className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <label
                      htmlFor="employee"
                      className="font-medium cursor-pointer"
                    >
                      Employee
                    </label>
                    <p className="text-sm text-muted-foreground">
                      View and update issue statuses
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedRole === "admin"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedRole("admin")}
                >
                  <RadioGroupItem value="admin" id="admin" />
                  <Shield className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <label
                      htmlFor="admin"
                      className="font-medium cursor-pointer"
                    >
                      Administrator
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Full access to manage all issues and employees
                    </p>
                  </div>
                </motion.div>
              </RadioGroup>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleRoleSelect}
                className="w-full font-medium py-6 text-base"
                variant="gradient"
                size="lg"
              >
                Continue to Dashboard
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default RoleSelection;
