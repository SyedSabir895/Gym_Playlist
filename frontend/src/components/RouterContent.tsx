import { Switch, Route } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Library from "@/pages/library";
import Category from "@/pages/category";
import VideoDetail from "@/pages/video";
import Login from "@/pages/login";
import Register from "@/pages/register";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export function RouterContent() {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground flex flex-col">
      {!isLoading && (user || !["/login", "/register"].includes(window.location.pathname)) && <Navbar />}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 animate-in fade-in duration-500">
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/" component={Home} />
          <Route path="/library">
            {() => <ProtectedRoute component={Library} />}
          </Route>
          <Route path="/category/:name">
            {() => <ProtectedRoute component={Category} />}
          </Route>
          <Route path="/video/:id">
            {() => <ProtectedRoute component={VideoDetail} />}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}
