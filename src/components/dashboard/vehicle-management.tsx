"use client";

import { useState, useMemo } from "react";
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
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/use-language";
import { Vehicle, VehicleStatus, VehicleTypeDefinition } from "@/lib/types";
import { Truck, Car, Bike, PlusCircle, MoreHorizontal, Trash2, Settings, CheckCircle, Clock, Wrench, Search } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { VehicleCreationForm } from "./vehicle-creation-form";
import { useToast } from "@/hooks/use-toast";
import { ManageVehicleTypesDialog } from "./manage-vehicle-types-dialog";

export function VehicleManagement() {
  const { t } = useLanguage();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isAddVehicleDialogOpen, setIsAddVehicleDialogOpen] = useState(false);
  const [isManageTypesDialogOpen, setIsManageTypesDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const vehiclesQuery = useMemoFirebase(() => collection(firestore, 'vehicles'), [firestore]);
  const { data: vehicles, isLoading } = useCollection<Vehicle>(vehiclesQuery);
  const { data: vehicleTypes } = useCollection<VehicleTypeDefinition>(useMemoFirebase(() => collection(firestore, 'vehicle_types'), [firestore]));

  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];
    return vehicles.filter(vehicle =>
        vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vehicles, searchTerm]);

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

  const handleStatusChange = (vehicleId: string, status: VehicleStatus) => {
    const vehicleRef = doc(firestore, 'vehicles', vehicleId);
    updateDocumentNonBlocking(vehicleRef, { status });
    toast({
      title: "Status Updated",
      description: `Vehicle status changed to ${status}.`,
    });
  };

  const vehicleIcons: { [key: string]: React.ElementType } = {
    'Truck': Truck,
    'Van': Car,
    'Motorcycle': Bike,
    'default': Truck,
  };

  if (isLoading) {
    return <div>Loading vehicles...</div>
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
            type="search"
            placeholder="Search vehicles by name, type, location..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsManageTypesDialogOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Manage Types
            </Button>
            <Dialog open={isAddVehicleDialogOpen} onOpenChange={setIsAddVehicleDialogOpen}>
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
                <VehicleCreationForm 
                onVehicleCreated={() => setIsAddVehicleDialogOpen(false)} 
                vehicleTypes={vehicleTypes || []}
                />
            </DialogContent>
            </Dialog>
        </div>
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
          {filteredVehicles.map((vehicle) => {
            const Icon = vehicle.type ? (vehicleIcons[vehicle.type] || vehicleIcons['default']) : Truck;
            return (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
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
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
                           <DropdownMenuSubContent>
                              <DropdownMenuItem onClick={() => handleStatusChange(vehicle.id, 'available')}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Available
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(vehicle.id, 'in-use')}>
                                <Clock className="mr-2 h-4 w-4" /> In Use
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(vehicle.id, 'maintenance')}>
                                <Wrench className="mr-2 h-4 w-4" /> Maintenance
                              </DropdownMenuItem>
                           </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
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
       <ManageVehicleTypesDialog 
        isOpen={isManageTypesDialogOpen}
        onOpenChange={setIsManageTypesDialogOpen}
        vehicleTypes={vehicleTypes || []}
      />
    </>
  );
}
