"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";
import { vehicles } from "@/lib/data";
import { VehicleStatus } from "@/lib/types";
import { Truck, Car, Motorcycle } from 'lucide-react';

export function VehicleManagement() {
  const { t } = useLanguage();
  
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

  const vehicleIcons = {
    'Truck': Truck,
    'Van': Car,
    'Motorcycle': Motorcycle
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('vehicles.name')}</TableHead>
          <TableHead>{t('vehicles.type')}</TableHead>
          <TableHead>{t('vehicles.capacity')}</TableHead>
          <TableHead>{t('vehicles.status')}</TableHead>
          <TableHead>{t('vehicles.location')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vehicles.map((vehicle) => {
          const Icon = vehicleIcons[vehicle.type];
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
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  );
}
