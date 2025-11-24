"use client";

import { Button } from "@/components/ui/button";
import { Plus, Folder, Pencil, MoreVertical } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface Collection {
    id: string;
    name: string;
    _count?: {
        angles: number;
    };
}

interface CollectionSidebarProps {
    collections: Collection[];
    onSelect: (id: string | null) => void;
    selectedId: string | null;
    onCreate: (name: string) => void;
    onMoveAngle?: (angleId: string, collectionId: string | null) => void;
    onRename?: (collectionId: string, newName: string) => void;
    allAnglesCount?: number;
}

export function CollectionSidebar({ collections, onSelect, selectedId, onCreate, onMoveAngle, onRename, allAnglesCount }: CollectionSidebarProps) {
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | "all" | null>(null);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [editCollectionName, setEditCollectionName] = useState("");
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);

  const handleCreate = () => {
    if (!newCollectionName.trim()) return;
    onCreate(newCollectionName);
    setNewCollectionName("");
    setIsDialogOpen(false);
  };

  const handleRenameClick = (collection: Collection) => {
    setEditingCollectionId(collection.id);
    setEditCollectionName(collection.name);
    setIsRenameDialogOpen(true);
  };

  const handleRename = () => {
    if (!editingCollectionId || !editCollectionName.trim()) return;
    if (onRename) {
      onRename(editingCollectionId, editCollectionName.trim());
    }
    setEditingCollectionId(null);
    setEditCollectionName("");
    setIsRenameDialogOpen(false);
  };

  const handleDragOver = (e: React.DragEvent, collectionId: string | null | "all") => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(collectionId === null ? "all" : collectionId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, collectionId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverId(null);

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data.angleId && onMoveAngle) {
        onMoveAngle(data.angleId, collectionId);
      }
    } catch (error) {
      console.error("Failed to parse drag data:", error);
    }
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
      
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Collection</DialogTitle>
          </DialogHeader>
          <Input 
            placeholder="Collection Name" 
            value={editCollectionName} 
            onChange={(e) => setEditCollectionName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRename();
              }
            }}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="space-y-1 overflow-y-auto flex-1">
        <Button 
            variant={selectedId === null ? "secondary" : "ghost"} 
            className={`w-full justify-start flex ${dragOverId === "all" ? "bg-primary/20 border-2 border-primary border-dashed" : ""}`}
            onClick={() => onSelect(null)}
            onDragOver={(e) => handleDragOver(e, "all")}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, null)}
        >
            <Folder className="mr-2 h-4 w-4 shrink-0" /> 
            <span className="flex-1 text-left">All Angles</span>
            {allAnglesCount !== undefined && allAnglesCount > 0 && (
                <Badge variant="secondary" className="ml-auto shrink-0">
                    {allAnglesCount}
                </Badge>
            )}
        </Button>
        {collections.map((c) => (
             <div key={c.id} className="group relative flex items-center gap-1">
                <Button 
                    variant={selectedId === c.id ? "secondary" : "ghost"} 
                    className={`flex-1 justify-start flex ${dragOverId === c.id ? "bg-primary/20 border-2 border-primary border-dashed" : ""}`}
                    onClick={() => onSelect(c.id)}
                    onDragOver={(e) => handleDragOver(e, c.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, c.id)}
                >
                    <Folder className="mr-2 h-4 w-4 shrink-0" /> 
                    <span className="truncate flex-1 text-left">{c.name}</span>
                    {c._count && c._count.angles > 0 && (
                        <Badge variant="secondary" className="ml-auto shrink-0">
                            {c._count.angles}
                        </Badge>
                    )}
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRenameClick(c)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Rename
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
             </div>
        ))}
      </div>
    </div>
  );
}
