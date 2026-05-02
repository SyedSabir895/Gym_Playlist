import { Link } from "wouter";
import { PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Video } from "@/lib/api";

export function VideoCard({ video }: { video: Video }) {
  return (
    <Link href={`/video/${video.id}`} className="group block">
      <div className="flex flex-col gap-3 rounded-lg bg-card border border-border/40 overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(255,100,0,0.1)] h-full">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <PlayCircle className="w-12 h-12 opacity-50" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] bg-black/40">
            <div className="bg-primary text-primary-foreground rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <PlayCircle className="w-8 h-8" />
            </div>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1 gap-2">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className="bg-secondary/50 hover:bg-secondary text-[10px] uppercase tracking-wider font-bold">
              {video.category}
            </Badge>
            <span className="text-[10px] text-muted-foreground font-mono uppercase">
              {format(new Date(video.createdAt), "MMM d, yyyy")}
            </span>
          </div>
          <h3 className="font-semibold text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {video.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
