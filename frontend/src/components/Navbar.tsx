import { Link, useLocation } from "wouter";
import { Dumbbell, Library } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-16 items-center px-4 md:px-8 justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md group-hover:scale-105 transition-transform">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tight uppercase">REP<span className="text-primary">VAULT</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors hover:text-foreground/80 ${location === "/" ? "text-foreground" : "text-foreground/60"}`}
            >
              Dashboard
            </Link>
            <Link
              href="/library"
              className={`transition-colors hover:text-foreground/80 ${location === "/library" ? "text-foreground" : "text-foreground/60"}`}
            >
              Library
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/library" className="md:hidden">
            <Button variant="ghost" size="icon">
              <Library className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
