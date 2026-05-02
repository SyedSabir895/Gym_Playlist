import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateVideo } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";

const formSchema = z.object({
  youtubeUrl: z
    .string()
    .url("Must be a valid URL")
    .refine((v) => v.includes("youtube.com") || v.includes("youtu.be"), {
      message: "Must be a YouTube URL",
    }),
  title: z.string().min(2, "Title must be at least 2 characters").max(100, "Title is too long"),
  category: z.string().min(2, "Category must be at least 2 characters"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function VideoForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const createVideo = useCreateVideo();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { youtubeUrl: "", title: "", category: "", notes: "" },
  });

  const onSubmit = (data: FormValues) => {
    createVideo.mutate(data, {
      onSuccess: () => {
        toast({ title: "Video added to vault", description: "Ready for your next session." });
        form.reset();
        if (onSuccess) onSuccess();
      },
      onError: (error: unknown) => {
        const msg = (error as { error?: string })?.error || "Please check the URL and try again.";
        toast({ title: "Failed to add video", description: msg, variant: "destructive" });
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
