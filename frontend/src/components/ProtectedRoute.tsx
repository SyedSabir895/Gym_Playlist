import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader } from "lucide-react";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
}

export function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const hasAuthToken = typeof window !== "undefined" && !!localStorage.getItem("authToken");

  useEffect(() => {
    if (!isLoading && !user && !hasAuthToken) {
      navigate("/login");
    }
  }, [user, isLoading, hasAuthToken, navigate]);

  if (isLoading || (!user && hasAuthToken)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Component />;
}
