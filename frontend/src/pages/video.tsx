import { Link, useLocation, useParams } from "wouter";
import { format } from "date-fns";
import { ArrowLeft, Trash2, Calendar, Folder, AlignLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useGetVideo, useDeleteVideo } from "@/hooks/useApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function VideoDetail() {
  const params = useParams();
  const id = params.id as string;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: video, isLoading, error } = useGetVideo(id);
  const deleteVideo = useDeleteVideo();

  const handleDelete = () => {
    deleteVideo.mutate(id, {
      onSuccess: () => {
        toast({ title: "Video removed", description: "The video has been deleted from your vault." });
        setLocation("/library");
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to delete video. Please try again.", variant: "destructive" });
      },
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-destructive" />
        <h2 className="text-2xl font-bold uppercase tracking-wider">Video Not Found</h2>
        <p className="text-muted-foreground">This drill might have been deleted or doesn't exist.</p>
        <Link href="/library">
          <Button variant="outline" className="mt-4 font-bold uppercase tracking-widest">Back to Library</Button>
        </Link>
      </div>
    );
  }

  if (isLoading || !video) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        <Skeleton className="h-10 w-32 bg-muted/50" />
        <Skeleton className="aspect-video w-full rounded-xl bg-muted/50" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4 bg-muted/50" />
          <div className="flex gap-4">
            <Skeleton className="h-6 w-24 bg-muted/50" />
            <Skeleton className="h-6 w-32 bg-muted/50" />
          </div>
          <Skeleton className="h-32 w-full bg-muted/50 mt-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <Link href="/library">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground -ml-2 uppercase text-xs font-bold tracking-widest">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </Link>

      <div className="-mx-4 sm:mx-0 rounded-xl overflow-hidden bg-card border border-border/50 shadow-xl ring-1 ring-white/5">
        <div className="aspect-5/4 md:aspect-video w-full bg-black relative">
          {video.googleFileId ? (
            <iframe
              src={`https://drive.google.com/file/d/${video.googleFileId}/preview`}
              className="absolute inset-0 w-full h-full border-0"
              allow="autoplay"
            />
          ) : video.isLocal ? (
            <video
              src={video.videoUrl}
              controls
              className="absolute inset-0 w-full h-full border-0"
            />
          ) : (
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=0&rel=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-4 flex-1">
          <h1 className="text-3xl md:text-4xl font-black leading-tight">{video.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {video.googleFileId && (
              <a href={`https://drive.google.com/file/d/${video.googleFileId}/view`} target="_blank" rel="noreferrer">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-bold uppercase tracking-widest px-3 py-1 cursor-pointer transition-colors">
                  Open in Drive
                </Badge>
              </a>
            )}
            <Link href={`/category/${encodeURIComponent(video.category)}`}>
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 font-bold uppercase tracking-widest px-3 py-1 cursor-pointer transition-colors">
                <Folder className="w-3 h-3 mr-2 inline-block" />
                {video.category}
              </Badge>
            </Link>
            <div className="flex items-center font-mono">
              <Calendar className="w-4 h-4 mr-2" />
              {format(new Date(video.createdAt), "MMMM d, yyyy")}
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="font-bold uppercase tracking-widest w-full md:w-auto cursor-pointer">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Drill
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="uppercase font-black tracking-wide">Delete this video?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground text-base">
                  This will permanently remove "{video.title}" from your vault. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="font-bold uppercase tracking-widest border-border hover:bg-secondary">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold uppercase tracking-widest">
                  Yes, Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {video.notes && (
        <div className="bg-card/50 border border-border/50 rounded-xl p-6 md:p-8 mt-8 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
          <h3 className="font-bold uppercase tracking-widest flex items-center gap-2 mb-4 text-muted-foreground">
            <AlignLeft className="w-5 h-5" /> Training Notes
          </h3>
          <div className="prose prose-invert max-w-none text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {video.notes}
          </div>
        </div>
      )}
    </div>
  );
}
