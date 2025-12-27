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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/hooks/use-language";
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { User } from "@/lib/types";
import { PlusCircle, MoreHorizontal, Trash2, CheckCircle, XCircle } from "lucide-react";
import { RegistrationForm } from "@/components/auth/registration-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { Badge } from "@/components/ui/badge";

export function UserManagement() {
  const { t } = useLanguage();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading } = useCollection<User>(usersQuery);

  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const handleDeleteUser = (userId: string) => {
    if (currentUser?.id === userId) {
      toast({
        variant: "destructive",
        title: "Action Forbidden",
        description: "You cannot delete your own account.",
      });
      return;
    }
    const userRef = doc(firestore, 'users', userId);
    deleteDocumentNonBlocking(userRef);
    toast({
      title: "User Deleted",
      description: "The user has been removed from the system.",
    });
    // Note: This does not delete the user from Firebase Authentication, only Firestore.
    // A cloud function would be needed for a complete deletion.
  };

  const handleToggleAvailability = (user: User) => {
    const newAvailability = !(user.availability ?? false);
    const userRef = doc(firestore, 'users', user.id);
    updateDocumentNonBlocking(userRef, { availability: newAvailability });
    toast({
      title: "Driver Status Updated",
      description: `${user.name} is now marked as ${newAvailability ? 'available' : 'unavailable'}.`,
    });
  };

  if (isLoading) {
    return <div>Loading users...</div>
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('users.addNew')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('users.createNew')}</DialogTitle>
            </DialogHeader>
            <RegistrationForm onRegistrationComplete={() => setIsDialogOpen(false)} isAdminRegistration={true} />
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('users.name')}</TableHead>
            <TableHead>{t('users.email')}</TableHead>
            <TableHead>{t('users.role')}</TableHead>
            <TableHead>Status</TableHead>
            <TableHead><span className="sr-only">Actions</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users && users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="font-medium">{user.name}</div>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                {user.role === 'Driver' && (
                  <Badge variant={user.availability ? 'secondary' : 'destructive'}>
                    {user.availability ? 'Available' : 'Unavailable'}
                  </Badge>
                )}
              </TableCell>
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
                      <DropdownMenuSeparator />
                       {user.role === 'Driver' && (
                        <DropdownMenuItem onClick={() => handleToggleAvailability(user)}>
                          {user.availability ? (
                            <><XCircle className="mr-2 h-4 w-4" /> Mark as Absent</>
                          ) : (
                            <><CheckCircle className="mr-2 h-4 w-4" /> Mark as Present</>
                          )}
                        </DropdownMenuItem>
                      )}
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('users.delete')}
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('users.deleteConfirmTitle')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('users.deleteConfirmDescription')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('jobs.cancel')}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {t('users.delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
