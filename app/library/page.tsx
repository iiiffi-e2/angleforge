"use client";

import { useState, useEffect } from "react";
import { CollectionSidebar } from "@/components/CollectionSidebar";
import { AngleCard } from "@/components/AngleCard";
import { toast } from "sonner";
import { AngleObject } from "@/lib/openai";
import { Button } from "@/components/ui/button";
import { Download, Lock } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function LibraryPage() {
  const [collections, setCollections] = useState([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [angles, setAngles] = useState<AngleObject[]>([]);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState("free");

  const fetchCollections = async () => {
    const res = await fetch("/api/collections");
    if (res.ok) {
      const data = await res.json();
      setCollections(data);
    }
  };

  const fetchAngles = async () => {
    setLoading(true);
    let url = "/api/angles";
    if (selectedId) url += `?collectionId=${selectedId}`;
    
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setAngles(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetch("/api/usage").then(r => r.json()).then(d => setPlan(d.plan)).catch(() => {});
    fetchCollections();
  }, []);

  useEffect(() => {
    fetchAngles();
  }, [selectedId]);

  const createCollection = async (name: string) => {
    if (plan === 'free') {
        toast.error("Collections are a Pro feature");
        return;
    }
    const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    });
    if (res.ok) {
        toast.success("Collection created");
        fetchCollections();
    } else {
        toast.error("Failed to create collection");
    }
  };

  const handleExport = (format: string) => {
     if (plan === 'free') {
         toast.error("Export is a Pro feature");
         return;
     }
     
     let text = "";
     if (format === 'csv') {
         text = "Name,Hook,Headline,Explanation\n" + angles.map(a => `"${a.angleName}","${a.hook.replace(/"/g, '""')}","${a.headline.replace(/"/g, '""')}","${a.explanation.replace(/"/g, '""')}"`).join("\n");
     } else if (format === 'md') {
         text = angles.map(a => `## ${a.angleName}\n**Hook:** ${a.hook}\n**Headline:** ${a.headline}\n\n${a.explanation}\n`).join("\n---\n");
     } else {
         text = angles.map(a => `Name: ${a.angleName}\nHook: ${a.hook}\nHeadline: ${a.headline}\nExplanation: ${a.explanation}\n`).join("\n\n");
     }
     
     const blob = new Blob([text], { type: 'text/plain' });
     const url = window.URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `angles.${format}`;
     a.click();
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-100px)]">
      <aside className="w-full md:w-64 shrink-0">
        <CollectionSidebar 
            collections={collections} 
            selectedId={selectedId} 
            onSelect={setSelectedId} 
            onCreate={createCollection}
        />
      </aside>
      <main className="flex-1 overflow-y-auto">
         <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold">
                 {selectedId ? collections.find((c: any) => c.id === selectedId)?.name : "All Angles"}
             </h2>
             <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                     <Button variant="outline" size="sm">
                         <Download className="mr-2 h-4 w-4" /> Export {plan === 'free' && <Lock className="ml-2 h-3 w-3" />}
                     </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent>
                     <DropdownMenuItem onClick={() => handleExport('csv')}>CSV</DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handleExport('md')}>Markdown</DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handleExport('txt')}>Text</DropdownMenuItem>
                 </DropdownMenuContent>
             </DropdownMenu>
         </div>

         {loading ? (
             <div className="p-4">Loading...</div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
                {angles.map((angle: any) => (
                    <AngleCard key={angle.id} angle={angle} onSave={() => {}} isSaved={true} />
                ))}
                {angles.length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center mt-10">No angles found.</p>
                )}
            </div>
         )}
      </main>
    </div>
  );
}
