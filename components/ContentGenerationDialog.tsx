"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AngleObject } from "@/lib/openai";
import { toast } from "sonner";
import { Copy, Loader2, RefreshCw, Download } from "lucide-react";

const formSchema = z.object({
  contentType: z.enum(["LinkedIn Post", "Blog Post", "Email", "Ad Copy", "Social Caption"], {
    required_error: "Content type is required",
  }),
  length: z.enum(["Short", "Medium", "Long"]).optional(),
  customCTA: z.string().optional(),
  generateImage: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ContentGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  angle: AngleObject & { sourceTopic?: string };
}

export function ContentGenerationDialog({
  open,
  onOpenChange,
  angle,
}: ContentGenerationDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contentType: undefined,
      length: "Medium",
      customCTA: "",
      generateImage: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsGenerating(true);
    setGeneratedContent(null);
    setGeneratedImageUrl(null);

    try {
      const response = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          angleName: angle.angleName,
          hook: angle.hook,
          headline: angle.headline,
          explanation: angle.explanation,
          visualSuggestion: angle.visualSuggestion,
          channel: angle.channel,
          tone: angle.tone,
          goal: angle.goal,
          audience: angle.audience,
          sourceTopic: angle.sourceTopic,
          contentType: data.contentType,
          length: data.length,
          customCTA: data.customCTA,
          generateImage: data.generateImage || false,
        }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          toast.error("Content generation is only available for Pro users.");
          onOpenChange(false);
          return;
        }
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate content");
      }

      const result = await response.json();
      setGeneratedContent(result.content);
      setContentType(result.contentType);
      if (result.imageUrl) {
        setGeneratedImageUrl(result.imageUrl);
      }
      toast.success("Content generated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      toast.success("Content copied to clipboard");
    }
  };

  const handleGenerateAgain = () => {
    setGeneratedContent(null);
    setGeneratedImageUrl(null);
    form.reset({
      contentType: form.getValues("contentType"),
      length: form.getValues("length"),
      customCTA: form.getValues("customCTA"),
      generateImage: form.getValues("generateImage"),
    });
  };

  const handleDownloadImage = async () => {
    if (!generatedImageUrl) return;
    
    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `angle-image-${angle.angleName.replace(/\s+/g, "-")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setGeneratedContent(null);
      setGeneratedImageUrl(null);
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Content</DialogTitle>
          <DialogDescription>
            Transform your angle into fully written marketing content.
          </DialogDescription>
        </DialogHeader>

        {!generatedContent ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="contentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LinkedIn Post">LinkedIn Post</SelectItem>
                        <SelectItem value="Blog Post">Blog Post</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Ad Copy">Ad Copy</SelectItem>
                        <SelectItem value="Social Caption">Social Caption</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Short">Short</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Long">Long</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customCTA"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom CTA (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Sign up for our newsletter"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="generateImage"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        Generate Image
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Create an image based on the visual suggestion: "{angle.visualSuggestion}"
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isGenerating} className="flex-1">
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Content"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Generated {contentType}</h3>
                <p className="text-sm text-muted-foreground">
                  Your content is ready to use
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Content
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAgain}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Again
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-muted/30 max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-sans">
                {generatedContent}
              </pre>
            </div>

            {generatedImageUrl && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Generated Image</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadImage}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden bg-muted/30">
                  <img
                    src={generatedImageUrl}
                    alt={`Generated image for ${angle.angleName}`}
                    className="w-full h-auto max-h-[400px] object-contain"
                    onError={(e) => {
                      toast.error("Failed to load image");
                      setGeneratedImageUrl(null);
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

