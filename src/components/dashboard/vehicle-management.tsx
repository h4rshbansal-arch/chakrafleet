"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { Vehicle, VehicleStatus } from "@/lib/types";
import { Truck, Car, Bike, PlusCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { VehicleCreationForm } from "./vehicle-creation-form";
import { useToast } from "@/hooks/use-toast";

export function VehicleManagement() {
  const { t } = useLanguage();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const vehiclesQuery = useMemoFirebase(() => collection(firestore, 'vehicles'), [firestore]);
  const { data: vehicles, isLoading } = useCollection<Vehicle>(vehiclesQuery);

  const getStatusBadgeVariant = (status: VehicleStatus) => {
    switch (status) {
      case "available":
        return "secondary";
      case "in-use":
        return "default";
      case "maintenance":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    const vehicleRef = doc(firestore, 'vehicles', vehicleId);
    deleteDocumentNonBlocking(vehicleRef);
    toast({
      title: "Vehicle Deleted",
      description: "The vehicle has been removed from the system.",
    });
  };

  const vehicleIcons: { [key: string]: React.ElementType } = {
    'Truck': Truck,
    'Van': Car,
    'Motorcycle': Bike
  }

  if (isLoading) {
    return <div>Loading vehicles...</div>
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('vehicles.addNew')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('vehicles.createNew')}</DialogTitle>
            </DialogHeader>
            <VehicleCreationForm onVehicleCreated={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('vehicles.name')}</TableHead>
            <TableHead>{t('vehicles.type')}</TableHead>
            <TableHead>{t('vehicles.capacity')}</TableHead>
            <TableHead>{t('vehicles.status')}</TableHead>
            <TableHead>{t('vehicles.location')}</TableHead>
            <TableHead><span className="sr-only">Actions</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles && vehicles.map((vehicle) => {
            const Icon = vehicle.type ? vehicleIcons[vehicle.type] : null;
            return (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                    {vehicle.type}
                  </div>
                </TableCell>
                <TableCell>{vehicle.capacity}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(vehicle.status)}>{vehicle.status}</Badge>
                </TableCell>
                <TableCell>{vehicle.location}</TableCell>
                <TableCell>
                   <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('jobs.actions')}</DropdownMenuLabel>
                         <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('vehicles.delete')}
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('vehicles.deleteConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('vehicles.deleteConfirmDescription')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('jobs.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                           className="bg-destructive hover:bg-destructive/90"
                        >
                          {t('vehicles.delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </>
  );
}
