"use client";

import { useState, useEffect } from "react";
import { AngleObject } from "@/lib/openai"; 
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Save, CheckCircle2, FileText } from "lucide-react";
import { toast } from "sonner";
import { ContentGenerationDialog } from "@/components/ContentGenerationDialog";
import { UpgradeDialog } from "@/components/UpgradeDialog";

interface AngleCardProps {
  angle: AngleObject & { sourceTopic?: string };
  onSave: (angle: AngleObject) => void;
  isSaved?: boolean;
  onToggleUsed?: (angle: AngleObject) => void;
  userPlan?: string;
}

export function AngleCard({ angle, onSave, isSaved = false, onToggleUsed, userPlan }: AngleCardProps) {
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [plan, setPlan] = useState<string>("free");

  useEffect(() => {
    if (userPlan) {
      setPlan(userPlan);
    } else {
      // Fetch plan if not provided
      fetch("/api/usage")
        .then((r) => r.json())
        .then((d) => setPlan(d.plan))
        .catch(() => {});
    }
  }, [userPlan]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleGenerateContent = () => {
    if (plan === "pro") {
      setContentDialogOpen(true);
    } else {
      setUpgradeDialogOpen(true);
    }
  };

  const isUsed = angle.used === true;

  return (
    <Card className={`h-full flex flex-col hover:shadow-md transition-shadow ${isUsed ? 'opacity-75 border-muted' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex gap-2">
            <Badge variant="outline">{angle.channel}</Badge>
            <Badge>{angle.tone}</Badge>
            {isUsed && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Used
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-lg mt-2 leading-tight">{angle.angleName}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div>
          <h4 className="font-semibold text-xs uppercase text-muted-foreground mb-1">Hook</h4>
          <p className="text-sm font-medium cursor-pointer hover:text-primary p-2 bg-muted/30 rounded-md" onClick={() => copyToClipboard(angle.hook)}>{angle.hook}</p>
        </div>
        <div>
          <h4 className="font-semibold text-xs uppercase text-muted-foreground mb-1">Headline</h4>
          <p className="text-sm font-medium cursor-pointer hover:text-primary" onClick={() => copyToClipboard(angle.headline)}>{angle.headline}</p>
        </div>
        <div>
          <h4 className="font-semibold text-xs uppercase text-muted-foreground mb-1">Explanation</h4>
          <p className="text-sm text-muted-foreground">{angle.explanation}</p>
        </div>
        <div>
          <h4 className="font-semibold text-xs uppercase text-muted-foreground mb-1">Visual</h4>
          <p className="text-sm text-muted-foreground italic border-l-2 pl-2">{angle.visualSuggestion}</p>
        </div>
      </CardContent>
      <CardFooter className="gap-2 pt-2 flex-col">
        <div className="flex gap-2 w-full">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => copyToClipboard(`${angle.hook}\n\n${angle.headline}\n\n${angle.explanation}`)}>
            <Copy className="w-4 h-4 mr-2" /> Copy
          </Button>
          {isSaved && onToggleUsed ? (
            <Button 
              size="sm" 
              className="flex-1" 
              onClick={() => onToggleUsed(angle)} 
              variant={isUsed ? "secondary" : "default"}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> {isUsed ? "Mark Unused" : "Mark Used"}
            </Button>
          ) : (
            <Button size="sm" className="flex-1" onClick={() => onSave(angle)} disabled={isSaved} variant={isSaved ? "secondary" : "default"}>
              <Save className="w-4 h-4 mr-2" /> {isSaved ? "Saved" : "Save"}
            </Button>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={handleGenerateContent}
        >
          <FileText className="w-4 h-4 mr-2" /> Generate Content
        </Button>
      </CardFooter>
      <ContentGenerationDialog
        open={contentDialogOpen}
        onOpenChange={setContentDialogOpen}
        angle={angle}
      />
      <UpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
      />
    </Card>
  );
}
