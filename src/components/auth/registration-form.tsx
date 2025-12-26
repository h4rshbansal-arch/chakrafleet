"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface RegistrationFormProps {
  onRegistrationComplete?: () => void;
}

export function RegistrationForm({ onRegistrationComplete }: RegistrationFormProps) {
  const { signup } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('Driver');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup(email, password, name, role, { redirect: false });
      toast({
        title: "User Created",
        description: `Account for ${name} has been created successfully.`,
      });
      onRegistrationComplete?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Could not create the account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
       <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
       <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
            <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="Driver">Driver</SelectItem>
                <SelectItem value="Supervisor">Supervisor</SelectItem>
                 <SelectItem value="Admin">Admin</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
}
