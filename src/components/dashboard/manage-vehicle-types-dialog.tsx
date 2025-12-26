"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { VehicleTypeDefinition } from "@/lib/types";
import { Trash2, Plus } from "lucide-react";

interface ManageVehicleTypesDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  vehicleTypes: VehicleTypeDefinition[];
}

export function ManageVehicleTypesDialog({ isOpen, onOpenChange, vehicleTypes }: ManageVehicleTypesDialogProps) {
  const [newTypeName, setNewTypeName] = useState("");
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleAddType = () => {
    if (!newTypeName.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Name",
        description: "Vehicle type name cannot be empty.",
      });
      return;
    }

    const typeId = newTypeName.toLowerCase().replace(/\s+/g, '-');
    const vehicleTypesCollection = collection(firestore, "vehicle_types");
    const newTypeRef = doc(vehicleTypesCollection, typeId);

    addDocumentNonBlocking(newTypeRef, { id: typeId, name: newTypeName });

    toast({
      title: "Vehicle Type Added",
      description: `"${newTypeName}" has been added.`,
    });
    setNewTypeName("");
  };

  const handleDeleteType = (typeId: string) => {
    const typeRef = doc(firestore, 'vehicle_types', typeId);
    deleteDocumentNonBlocking(typeRef);
    toast({
        title: "Vehicle Type Deleted",
        description: "The vehicle type has been removed.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Vehicle Types</DialogTitle>
          <DialogDescription>
            Add or remove vehicle types available for selection.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex gap-2">
                <Input
                    placeholder="New type name (e.g., Sedan)"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                />
                <Button onClick={handleAddType} size="icon">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-2">
                <h4 className="font-medium">Existing Types</h4>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {vehicleTypes.map((type) => (
                    <div key={type.id} className="flex items-center justify-between rounded-md border p-2">
                    <span>{type.name}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteType(type.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    </div>
                ))}
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
