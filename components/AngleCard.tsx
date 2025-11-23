"use client";

import { AngleObject } from "@/lib/openai"; 
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Save } from "lucide-react";
import { toast } from "sonner";

interface AngleCardProps {
  angle: AngleObject;
  onSave: (angle: AngleObject) => void;
  isSaved?: boolean;
}

export function AngleCard({ angle, onSave, isSaved = false }: AngleCardProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <Badge variant="outline">{angle.channel}</Badge>
          <Badge>{angle.tone}</Badge>
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
      <CardFooter className="gap-2 pt-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => copyToClipboard(`${angle.hook}\n\n${angle.headline}\n\n${angle.explanation}`)}>
          <Copy className="w-4 h-4 mr-2" /> Copy
        </Button>
        <Button size="sm" className="flex-1" onClick={() => onSave(angle)} disabled={isSaved} variant={isSaved ? "secondary" : "default"}>
          <Save className="w-4 h-4 mr-2" /> {isSaved ? "Saved" : "Save"}
        </Button>
      </CardFooter>
    </Card>
  );
}
