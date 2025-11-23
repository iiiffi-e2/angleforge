"use client";

import { Button } from "@/components/ui/button";
import { Plus, Folder } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Collection {
    id: string;
    name: string;
}

interface CollectionSidebarProps {
    collections: Collection[];
    onSelect: (id: string | null) => void;
    selectedId: string | null;
    onCreate: (name: string) => void;
}

export function CollectionSidebar({ collections, onSelect, selectedId, onCreate }: CollectionSidebarProps) {
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreate = () => {
    if (!newCollectionName.trim()) return;
    onCreate(newCollectionName);
    setNewCollectionName("");
    setIsDialogOpen(false);
  };

  return (
    <div className="bg-card border rounded-lg p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold">Collections</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
             <Button size="icon" variant="ghost"><Plus className="h-4 w-4" /></Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Collection</DialogTitle></DialogHeader>
            <Input 
                placeholder="Collection Name" 
                value={newCollectionName} 
                onChange={(e) => setNewCollectionName(e.target.value)} 
            />
            <DialogFooter>
                <Button onClick={handleCreate}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-1 overflow-y-auto flex-1">
        <Button 
            variant={selectedId === null ? "secondary" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => onSelect(null)}
        >
            <Folder className="mr-2 h-4 w-4" /> All Angles
        </Button>
        {collections.map((c) => (
             <Button 
                key={c.id}
                variant={selectedId === c.id ? "secondary" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => onSelect(c.id)}
            >
                <Folder className="mr-2 h-4 w-4" /> <span className="truncate">{c.name}</span>
            </Button>
        ))}
      </div>
    </div>
  );
}
