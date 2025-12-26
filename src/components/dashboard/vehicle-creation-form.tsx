"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection } from "firebase/firestore";
import { VehicleStatus, VehicleType } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  type: z.enum(['Truck', 'Van', 'Motorcycle']),
  capacity: z.string().min(1, "Capacity is required"),
  location: z.string().min(2, "Location is required"),
  status: z.enum(['available', 'in-use', 'maintenance']),
});

interface VehicleCreationFormProps {
    onVehicleCreated: () => void;
}

export function VehicleCreationForm({ onVehicleCreated }: VehicleCreationFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "Van",
      capacity: "",
      location: "",
      status: "available",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const vehiclesCollection = collection(firestore, "vehicles");
    
    addDocumentNonBlocking(vehiclesCollection, values);

    toast({
        title: t('notifications.vehicleCreated'),
        description: values.name,
    });
    form.reset();
    onVehicleCreated();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('vehicles.name')}</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Sprinter 31" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('vehicles.type')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a vehicle type" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Truck">Truck</SelectItem>
                        <SelectItem value="Van">Van</SelectItem>
                        <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                    </SelectContent>
                </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('vehicles.capacity')}</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 2.5 tons" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('vehicles.location')}</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Warehouse A, NYC" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('vehicles.status')}</FormLabel>
               <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="in-use">In Use</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {t('vehicles.createVehicleButton')}
        </Button>
      </form>
    </Form>
  );
}
