import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import { Navbar } from "@/components/Navbar";
import Home from "@/pages/home";
import Library from "@/pages/library";
import Category from "@/pages/category";
import VideoDetail from "@/pages/video";
import Login from "@/pages/login";
import Register from "@/pages/register";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RouterContent } from "@/components/RouterContent";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter>
              <RouterContent />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
