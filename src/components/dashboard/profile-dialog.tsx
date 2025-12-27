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
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";
import { Pen } from "lucide-react";

interface ProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function ProfileDialog({ isOpen, onOpenChange }: ProfileDialogProps) {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // Local state for form inputs
  const [name, setName] = useState(user?.name || "");

  if (!user) return null;

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map((n) => n[0]).join('');
  };

  const handleSave = async () => {
    try {
      await updateUserProfile(user.id, { name });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update your profile. Please try again.",
      });
    }
  };
  
  const handleCancel = () => {
    // Reset local state to original user data
    setName(user.name);
    setIsEditing(false);
  };

  const handleCloseDialog = (open: boolean) => {
    if (!open) {
      handleCancel(); // Reset state when dialog is closed
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
          <DialogDescription>
            {isEditing ? "Edit your profile information below." : "This is your user profile information."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={user.avatarUrl} alt={name} />
                        <AvatarFallback>{getInitials(name)}</AvatarFallback>
                    </Avatar>
                </div>

                {!isEditing ? (
                    <div className="space-y-1 text-center">
                        <h4 className="text-xl font-semibold">{user.name}</h4>
                        <p className="text-md text-muted-foreground">{user.email}</p>
                        <p className="text-sm font-medium text-primary">{user.role}</p>
                    </div>
                ) : (
                    <div className="w-full space-y-4">
                        <div className="space-y-2">
                           <Label htmlFor="name">Full Name</Label>
                           <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                    </div>
                )}
            </div>
        </div>
        <DialogFooter className="sm:justify-between">
           {!isEditing ? (
             <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                <Button onClick={() => setIsEditing(true)}>
                    <Pen className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
             </>
           ) : (
             <>
                <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
             </>
           )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
