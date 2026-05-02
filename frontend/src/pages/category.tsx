import { Link, useParams } from "wouter";
import { useListVideos } from "@/hooks/useApi";
import { VideoCard } from "@/components/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Category() {
  const params = useParams();
  const categoryName = params.name ? decodeURIComponent(params.name) : "";

  const { data: videos, isLoading } = useListVideos(categoryName || undefined);

  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-4 border-b border-border/40 pb-6">
        <Link href="/library">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground mb-2 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
          </Button>
        </Link>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight flex items-center gap-3">
          <Target className="w-10 h-10 text-primary" /> {categoryName}
        </h1>
        <p className="text-muted-foreground text-lg">Focus on the fundamentals.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
          <Target className="w-16 h-16 text-muted-foreground mb-6 opacity-20" />
          <h3 className="text-xl font-bold uppercase tracking-wide mb-2">No videos found</h3>
          <p className="text-muted-foreground text-center max-w-sm mb-6">There are no videos in this category yet.</p>
        </div>
      )}
    </div>
  );
}
