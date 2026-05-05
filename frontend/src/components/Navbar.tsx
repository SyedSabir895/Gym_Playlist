import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedButton from "@/components/ui/animated-button";
import { useAuth } from "@/contexts/AuthContext";
import chestBusterLogo from "@/assets/chesttt.png";

export function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto flex h-16 items-center px-4 md:px-8 justify-between">
        
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img
              src={chestBusterLogo}
              alt="logo"
              className="h-10 w-auto md:h-14"
            />
            <span className="font-black text-lg md:text-xl uppercase">
              CHEST<span className="text-primary">BUSTER</span>
            </span>
          </Link>
        </div>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
          {!["/", "/login", "/register"].includes(location) && (
            <Link href="/">Dashboard</Link>
          )}
          {user && <Link href="/library">Library</Link>}
        </nav>

        {/* RIGHT SIDE */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-foreground/60">
                {user.fullName}
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <AnimatedButton as="a" href="/login">
                Sign In
              </AnimatedButton>
              <AnimatedButton as="a" href="/register">
                Sign Up
              </AnimatedButton>
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* MOBILE MENU */}
    {open && (
  <div className="md:hidden px-4 pb-4 space-y-4 bg-background/95 text-foreground border-t border-border/50">
    
    {!["/", "/login", "/register"].includes(location) && (
      <Link href="/" onClick={() => setOpen(false)} className="block py-2 text-foreground">
        Dashboard
      </Link>
    )}

    {user && (
      <Link href="/library" onClick={() => setOpen(false)} className="block py-2 text-foreground">
        Library
      </Link>
    )}

    <div className="pt-4 border-t border-gray-700 space-y-3">
      {user ? (
        <>
          <div className="text-sm text-foreground/70">{user.fullName}</div>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              logout();
              setOpen(false);
            }}
          >
            Logout
          </Button>
        </>
      ) : (
        <>
          <AnimatedButton
            as="a"
            href="/login"
            className="w-full text-center bg-white text-white py-2 rounded-md"
          >
            Sign In
          </AnimatedButton>

          <AnimatedButton
            as="a"
            href="/register"
            className="w-full text-center bg-primary text-white py-2 rounded-md"
          >
            Sign Up
          </AnimatedButton>
        </>
      )}
    </div>
  </div>
)}
    </header>
  );
}