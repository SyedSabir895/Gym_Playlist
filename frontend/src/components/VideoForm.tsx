import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateVideo } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Upload, Link as LinkIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  youtubeUrl: z.string().optional(),
  title: z.string().min(2, "Title must be at least 2 characters").max(100, "Title is too long"),
  category: z.string().min(2, "Category must be at least 2 characters"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function VideoForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const { googleToken } = useAuth();
  const createVideo = useCreateVideo();
  const [uploadType, setUploadType] = useState<"youtube" | "local">("youtube");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { youtubeUrl: "", title: "", category: "", notes: "" },
  });

  const onSubmit = (data: FormValues) => {
    if (uploadType === "youtube" && !data.youtubeUrl) {
      toast({ title: "Validation Error", description: "YouTube URL is required", variant: "destructive" });
      return;
    }
    if (uploadType === "local") {
      if (!videoFile) {
        toast({ title: "Validation Error", description: "Video file is required", variant: "destructive" });
        return;
      }
      if (!googleToken) {
        toast({ title: "Auth Error", description: "Please sign in with Google to upload to Drive", variant: "destructive" });
        return;
      }
    }

    createVideo.mutate({
      ...data,
      videoFile: uploadType === "local" ? videoFile! : undefined,
    }, {
      onSuccess: () => {
        toast({ title: "Video added to vault", description: "Ready for your next session." });
        form.reset();
        setVideoFile(null);
        if (onSuccess) onSuccess();
      },
      onError: (error: unknown) => {
        const msg = (error as { error?: string })?.error || "Please check your input and try again.";
        toast({ title: "Failed to add video", description: msg, variant: "destructive" });
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={uploadType} onValueChange={(v) => setUploadType(v as any)} className="w-full">
          <TabsList className={`grid w-full bg-secondary/30 ${googleToken ? "grid-cols-2" : "grid-cols-1"}`}>
            <TabsTrigger value="youtube" className="gap-2">
              <LinkIcon className="w-4 h-4" /> YouTube
            </TabsTrigger>
            {googleToken && (
              <TabsTrigger value="local" className="gap-2">
                <Upload className="w-4 h-4" /> Local File
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="youtube" className="pt-4">
            <FormField
              control={form.control}
              name="youtubeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground uppercase text-xs font-bold tracking-wider">YouTube URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://youtube.com/watch?v=..." className="bg-secondary/50 border-border/50 focus-visible:ring-primary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          {googleToken && (
            <TabsContent value="local" className="pt-4">
              <div className="space-y-2">
                <label className="text-muted-foreground uppercase text-xs font-bold tracking-wider block">Select Video File</label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="file" 
                    accept="video/*" 
                    className="bg-secondary/50 border-border/50 focus-visible:ring-primary h-auto py-2"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  />
                </div>
                {videoFile && <p className="text-xs text-primary font-mono">{videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)</p>}
              </div>
            </TabsContent>
          )}
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Video Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Tom Platz Squat Tutorial" className="bg-secondary/50 border-border/50 focus-visible:ring-primary" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Category</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Legs, Chest, Mobility" className="bg-secondary/50 border-border/50 focus-visible:ring-primary" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Training Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g. Focus on driving through the heels..."
                  className="bg-secondary/50 border-border/50 focus-visible:ring-primary resize-none h-20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={createVideo.isPending} className="w-full font-bold uppercase tracking-widest h-12">
          {createVideo.isPending ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Storing...</>
          ) : (
            <><Plus className="w-5 h-5 mr-2" /> Add to Vault</>
          )}
        </Button>
      </form>
    </Form>
  );
}
