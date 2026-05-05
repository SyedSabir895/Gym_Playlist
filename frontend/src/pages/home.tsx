import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useGetVideoStats, useListVideos } from "@/hooks/useApi";
import { VideoCard } from "@/components/VideoCard";
import { VideoForm } from "@/components/VideoForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Dumbbell, PlaySquare, TrendingUp, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


export default function Home() {
  const { user } = useAuth();
  
  // Only fetch videos if authenticated
  const { data: stats, isLoading: statsLoading } = user ? useGetVideoStats() : { data: undefined, isLoading: false };
  const { data: recentVideos, isLoading: videosLoading } = user ? useListVideos() : { data: undefined, isLoading: false };

  // Landing page for unauthenticated users
  if (!user) {
    return (
      <div className="space-y-12 pb-10">
        <section className="space-y-6 py-12">
          <div className="space-y-3">
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight">
              ChestBuster
            </h1>
            <p className="text-2xl text-foreground/80">Your Personal Training Vault</p>
          </div>
          <p className="text-lg text-foreground/60 max-w-2xl">
            Organize, save, and track your favorite gym workout videos. Build a personalized library organized by muscle groups and training styles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 cursor-pointer bg-primary border border-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 text-lg rounded-md font-bold transition-all"
            >
              <Zap className="w-5 h-5" />
              Get Started
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center cursor-pointer px-6 py-3 text-lg bg-transparent border border-border text-foreground hover:bg-white/5 rounded-md font-bold transition-all"
            >
              Sign In
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-y border-border/40">
          <div className="space-y-3">
            <div className="h-12 w-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <PlaySquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Save Videos</h3>
            <p className="text-foreground/60">Add YouTube workout videos to your personal library with custom notes.</p>
          </div>
          <div className="space-y-3">
            <div className="h-12 w-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Organize by Category</h3>
            <p className="text-foreground/60">Categorize workouts by muscle groups or training types for easy access.</p>
          </div>
          <div className="space-y-3">
            <div className="h-12 w-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Track Progress</h3>
            <p className="text-foreground/60">Keep your training vault organized and always have your favorite workouts at hand.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      <section className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Command Center</h1>
        <p className="text-muted-foreground text-lg">Your personal training vault.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 border-border/50 backdrop-blur shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Drills</CardTitle>
            <PlaySquare className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-10 w-24 bg-muted/50" />
            ) : (
              <div className="text-4xl font-black">{stats?.total || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 backdrop-blur shadow-sm md:col-span-2 overflow-hidden relative">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-linear-to-l from-primary/10 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Top Categories</CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent className="relative z-10">
            {statsLoading ? (
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 bg-muted/50" />
                <Skeleton className="h-8 w-24 bg-muted/50" />
                <Skeleton className="h-8 w-16 bg-muted/50" />
              </div>
            ) : stats?.byCategory && stats.byCategory.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {stats.byCategory.slice(0, 5).map((cat) => (
                  <Link key={cat.name} href={`/category/${encodeURIComponent(cat.name)}`}>
                    <div className="flex items-center gap-2 bg-secondary/50 hover:bg-secondary px-3 py-1.5 rounded-md transition-colors cursor-pointer border border-border/40">
                      <span className="font-bold text-sm uppercase">{cat.name}</span>
                      <span className="bg-background text-xs font-mono px-1.5 py-0.5 rounded text-muted-foreground">{cat.count}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No categories yet.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="text-primary w-6 h-6" /> Recent Additions
            </h2>
            <Link href="/library" className="text-sm font-bold text-primary hover:text-primary/80 uppercase tracking-widest transition-colors">
              View All
            </Link>
          </div>
          {videosLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="aspect-video w-full rounded-lg bg-muted/50" />
                  <Skeleton className="h-4 w-1/4 bg-muted/50" />
                  <Skeleton className="h-6 w-3/4 bg-muted/50" />
                </div>
              ))}
            </div>
          ) : recentVideos && recentVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {recentVideos.slice(0, 4).map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/50 rounded-xl bg-card/20">
              <Dumbbell className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground text-center max-w-sm">Your vault is empty. Add a YouTube tutorial to start building your library.</p>
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div className="border-b border-border/40 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-tight">Quick Add</h2>
          </div>
          <Card className="bg-card border-border/50 shadow-md">
            <CardContent className="pt-6">
              <VideoForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
