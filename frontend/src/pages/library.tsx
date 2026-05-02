import { Link } from "wouter";
import { useListCategories, useListVideos } from "@/hooks/useApi";
import { VideoCard } from "@/components/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Dumbbell, Library as LibraryIcon } from "lucide-react";

export default function Library() {
  const { data: categories, isLoading: categoriesLoading } = useListCategories();
  const { data: videos, isLoading: videosLoading } = useListVideos();

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6">
        <section className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight flex items-center gap-3">
            <LibraryIcon className="w-10 h-10 text-primary" /> Full Library
          </h1>
          <p className="text-muted-foreground text-lg">Every rep, every tutorial, organized.</p>
        </section>
      </div>

      <div className="space-y-6">
        {categoriesLoading ? (
          <Skeleton className="h-10 w-full max-w-2xl bg-muted/50 rounded-md" />
        ) : categories && categories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <Link href="/library">
              <div className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-bold uppercase tracking-wider text-sm transition-transform hover:scale-105">
                All Videos
              </div>
            </Link>
            {categories.map((cat) => (
              <Link key={cat.name} href={`/category/${encodeURIComponent(cat.name)}`}>
                <div className="px-4 py-2 bg-secondary/50 hover:bg-secondary border border-border/50 text-foreground rounded-md font-bold uppercase tracking-wider text-sm transition-transform hover:scale-105 flex items-center gap-2 cursor-pointer">
                  {cat.name} <span className="opacity-50 text-xs font-mono">{cat.count}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        {videosLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="aspect-video w-full rounded-lg bg-muted/50" />
                <Skeleton className="h-4 w-1/4 bg-muted/50" />
                <Skeleton className="h-6 w-3/4 bg-muted/50" />
              </div>
            ))}
          </div>
        ) : videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 border border-dashed border-border/50 rounded-xl bg-card/20">
            <Dumbbell className="w-16 h-16 text-muted-foreground mb-6 opacity-20" />
            <h3 className="text-xl font-bold uppercase tracking-wide mb-2">No videos yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">Head back to the dashboard to start adding videos to your library.</p>
            <Link href="/">
              <div className="px-6 py-3 bg-primary text-primary-foreground font-bold uppercase tracking-widest rounded-md hover:bg-primary/90 transition-colors">
                Go to Dashboard
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
