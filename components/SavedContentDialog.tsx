"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Copy, Download, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GeneratedContent {
  id: string;
  contentType: string;
  content: string;
  imagePath: string | null;
  length: string | null;
  customCTA: string | null;
  createdAt: string;
}

interface SavedContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  angleId: string;
  onContentDeleted?: () => void;
}

export function SavedContentDialog({
  open,
  onOpenChange,
  angleId,
  onContentDeleted,
}: SavedContentDialogProps) {
  const [contentList, setContentList] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && angleId) {
      fetchContent();
    }
  }, [open, angleId]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/content/${angleId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch content");
      }
      const data = await response.json();
      setContentList(data);
    } catch (error) {
      toast.error("Failed to load saved content");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Content copied to clipboard");
  };

  const handleDownloadImage = async (imagePath: string) => {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `angle-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const handleDelete = async (contentId: string) => {
    if (!confirm("Are you sure you want to delete this content?")) {
      return;
    }

    setDeletingIds((prev) => new Set(prev).add(contentId));
    try {
      const response = await fetch(`/api/content/${angleId}?contentId=${contentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete content");
      }

      setContentList((prev) => prev.filter((c) => c.id !== contentId));
      toast.success("Content deleted");
      if (onContentDeleted) {
        onContentDeleted();
      }
    } catch (error) {
      toast.error("Failed to delete content");
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(contentId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Saved Content Generations</DialogTitle>
          <DialogDescription>
            View and manage all content generated for this angle.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : contentList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No saved content yet.</p>
            <p className="text-sm mt-2">Generate content and save it to see it here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contentList.map((content) => {
              const isExpanded = expandedIds.has(content.id);
              const isDeleting = deletingIds.has(content.id);

              return (
                <Card key={content.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{content.contentType}</Badge>
                          {content.length && (
                            <Badge variant="secondary" className="text-xs">
                              {content.length}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(content.createdAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(content.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  {!isExpanded && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">
                        {truncateContent(content.content)}
                      </p>
                      {content.imagePath && (
                        <div className="mt-2">
                          <img
                            src={content.imagePath}
                            alt="Generated content"
                            className="w-20 h-20 object-cover rounded border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </CardContent>
                  )}

                  {isExpanded && (
                    <CardContent className="pt-0 space-y-4">
                      <div className="border rounded-lg p-4 bg-muted/30 max-h-[300px] overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm font-sans">
                          {content.content}
                        </pre>
                      </div>

                      {content.imagePath && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Generated Image</h4>
                          <div className="border rounded-lg overflow-hidden">
                            <img
                              src={content.imagePath}
                              alt="Generated content"
                              className="w-full h-auto max-h-[300px] object-contain"
                              onError={(e) => {
                                toast.error("Failed to load image");
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {content.customCTA && (
                        <div className="text-sm">
                          <span className="font-semibold">Custom CTA: </span>
                          <span className="text-muted-foreground">{content.customCTA}</span>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(content.content)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Content
                        </Button>
                        {content.imagePath && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadImage(content.imagePath!)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download Image
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(content.id)}
                          disabled={isDeleting}
                          className="text-destructive hover:text-destructive"
                        >
                          {isDeleting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

