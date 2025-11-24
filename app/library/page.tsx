"use client";

import { useState, useEffect } from "react";
import { CollectionSidebar } from "@/components/CollectionSidebar";
import { AngleCard } from "@/components/AngleCard";
import { toast } from "sonner";
import { AngleObject } from "@/lib/openai";
import { Button } from "@/components/ui/button";
import { Download, Lock, Filter } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type UsageFilter = "all" | "used" | "unused";

export default function LibraryPage() {
  const [collections, setCollections] = useState([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [angles, setAngles] = useState<AngleObject[]>([]);
  const [allAngles, setAllAngles] = useState<AngleObject[]>([]);
  const [totalAnglesCount, setTotalAnglesCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState("free");
  const [usageFilter, setUsageFilter] = useState<UsageFilter>("all");

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
      setAllAngles(data);
      applyFilter(data, usageFilter);
    }
    setLoading(false);
  };

  const fetchTotalAnglesCount = async () => {
    const res = await fetch("/api/angles");
    if (res.ok) {
      const data = await res.json();
      setTotalAnglesCount(data.length);
    }
  };

  const applyFilter = (anglesToFilter: AngleObject[], filter: UsageFilter) => {
    if (filter === "all") {
      setAngles(anglesToFilter);
    } else if (filter === "used") {
      setAngles(anglesToFilter.filter(a => a.used === true));
    } else {
      setAngles(anglesToFilter.filter(a => !a.used || a.used === false));
    }
  };

  useEffect(() => {
    applyFilter(allAngles, usageFilter);
  }, [usageFilter, allAngles]);

  useEffect(() => {
    fetch("/api/usage").then(r => r.json()).then(d => setPlan(d.plan)).catch(() => {});
    fetchCollections();
    fetchTotalAnglesCount();
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

  const handleRenameCollection = async (collectionId: string, newName: string) => {
    try {
      const res = await fetch(`/api/collections/${collectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName })
      });

      if (!res.ok) throw new Error("Failed to rename collection");

      toast.success("Collection renamed");
      await fetchCollections();
      await fetchTotalAnglesCount();
    } catch (error) {
      toast.error("Failed to rename collection");
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

  const handleToggleUsed = async (angle: AngleObject) => {
    if (!angle.id) {
      toast.error("Cannot toggle usage for unsaved angle");
      return;
    }

    try {
      const res = await fetch(`/api/angles/${angle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ used: !angle.used })
      });

      if (!res.ok) throw new Error("Failed to update");

      const updatedAngle = await res.json();
      
      // Update the angle in state
      setAllAngles(prev => prev.map(a => a.id === angle.id ? updatedAngle : a));
      toast.success(updatedAngle.used ? "Marked as used" : "Marked as unused");
    } catch (error) {
      toast.error("Failed to update usage status");
    }
  };

  const handleMoveAngle = async (angleId: string, collectionId: string | null) => {
    try {
      // Get the current angle to know which collection it's coming from
      const currentAngle = allAngles.find(a => a.id === angleId);
      const sourceCollectionId = currentAngle?.collectionId || null;
      
      // Optimistically update the UI - remove the angle from current view immediately
      // If we're viewing a specific collection and the angle is being moved away, remove it
      if (selectedId && sourceCollectionId === selectedId && collectionId !== selectedId) {
        const updatedAllAngles = allAngles.filter(a => a.id !== angleId);
        setAllAngles(updatedAllAngles);
        applyFilter(updatedAllAngles, usageFilter);
      }
      
      const res = await fetch(`/api/angles/${angleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId })
      });

      if (!res.ok) throw new Error("Failed to move angle");

      const updatedAngle = await res.json();
      
      // Always refresh the angles list to ensure accurate state
      // This ensures the angle is removed from the source collection view
      await fetchAngles();
      // Refresh total count and collections (to update counts)
      await fetchTotalAnglesCount();
      await fetchCollections();
      
      const collectionName = collectionId 
        ? collections.find((c: any) => c.id === collectionId)?.name || "collection"
        : "All Angles";
      
      const sourceCollectionName = sourceCollectionId
        ? collections.find((c: any) => c.id === sourceCollectionId)?.name || "collection"
        : "All Angles";
      
      if (sourceCollectionId !== collectionId) {
        toast.success(`Angle moved from ${sourceCollectionName} to ${collectionName}`);
      } else {
        toast.success(`Angle moved to ${collectionName}`);
      }
    } catch (error) {
      // On error, refresh to restore correct state
      await fetchAngles();
      toast.error("Failed to move angle");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-100px)]">
      <aside className="w-full md:w-64 shrink-0">
        <CollectionSidebar 
            collections={collections} 
            selectedId={selectedId} 
            onSelect={setSelectedId} 
            onCreate={createCollection}
            onMoveAngle={handleMoveAngle}
            onRename={handleRenameCollection}
            allAnglesCount={totalAnglesCount}
        />
      </aside>
      <main className="flex-1 overflow-y-auto">
         <div className="flex justify-between items-center mb-4 gap-4">
             <h2 className="text-xl font-bold">
                 {selectedId ? collections.find((c: any) => c.id === selectedId)?.name : "All Angles"}
             </h2>
             <div className="flex gap-2">
                 <Select value={usageFilter} onValueChange={(value) => setUsageFilter(value as UsageFilter)}>
                     <SelectTrigger className="w-[120px]">
                         <Filter className="mr-2 h-4 w-4" />
                         <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                         <SelectItem value="all">All</SelectItem>
                         <SelectItem value="used">Used</SelectItem>
                         <SelectItem value="unused">Unused</SelectItem>
                     </SelectContent>
                 </Select>
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
         </div>

         {loading ? (
             <div className="p-4">Loading...</div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
                {angles.map((angle: any) => (
                    <AngleCard 
                        key={angle.id} 
                        angle={angle} 
                        onSave={() => {}} 
                        isSaved={true}
                        onToggleUsed={handleToggleUsed}
                        userPlan={plan}
                    />
                ))}
                {angles.length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center mt-10">
                        {usageFilter === "all" ? "No angles found." : `No ${usageFilter} angles found.`}
                    </p>
                )}
            </div>
         )}
      </main>
    </div>
  );
}
