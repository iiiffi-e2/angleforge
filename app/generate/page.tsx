"use client";

import { GenerateForm } from "@/components/GenerateForm";
import { AngleCard } from "@/components/AngleCard";
import { useState } from "react";
import { AngleObject } from "@/lib/openai";
import { toast } from "sonner";

export default function GeneratePage() {
  const [angles, setAngles] = useState<AngleObject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTopic, setCurrentTopic] = useState("");

  const handleGenerate = async (data: any) => {
    setIsLoading(true);
    setAngles([]);
    setCurrentTopic(data.topic);
    try {
      const res = await fetch("/api/angles/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        if (res.status === 429) {
          toast.error("Daily limit reached. Upgrade to Pro for more.");
          return;
        }
        throw new Error("Failed to generate");
      }

      const json = await res.json();
      setAngles(json.angles);
      toast.success("Angles generated!");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (angle: AngleObject) => {
    try {
      const res = await fetch("/api/angles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...angle,
            sourceTopic: currentTopic
        })
      });
      
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Angle saved to library");
    } catch (error) {
      toast.error("Failed to save angle");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-100px)]">
      <aside className="w-full md:w-80 shrink-0 overflow-y-auto p-1">
        <div className="bg-card border rounded-lg p-4">
            <h2 className="font-bold mb-4">Generate Angles</h2>
            <GenerateForm onGenerate={handleGenerate} isLoading={isLoading} />
        </div>
      </aside>
      
      <main className="flex-1 overflow-y-auto pr-2">
        {isLoading && (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )}
        
        {!isLoading && angles.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p>Enter details and click generate to get started.</p>
             </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
          {angles.map((angle, i) => (
            <AngleCard key={i} angle={angle} onSave={handleSave} />
          ))}
        </div>
      </main>
    </div>
  );
}
