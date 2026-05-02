import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertCircle className="h-16 w-16 text-destructive opacity-60" />
        <h1 className="text-4xl font-black uppercase tracking-tight">404</h1>
        <p className="text-muted-foreground text-lg">Page not found.</p>
        <Link href="/">
          <Button className="font-bold uppercase tracking-widest mt-2">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
