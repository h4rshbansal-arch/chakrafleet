"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Shield, Briefcase, Car } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { Logo } from '@/components/icons/logo';

export function LoginForm() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [role, setRole] = useState<UserRole>('Admin');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(role);
  };

  const roles: { id: UserRole, label: string, icon: React.ElementType }[] = [
    { id: 'Admin', label: t('login.admin'), icon: Shield },
    { id: 'Supervisor', label: t('login.supervisor'), icon: Briefcase },
    { id: 'Driver', label: t('login.driver'), icon: Car },
  ];

  return (
    <div className="flex flex-col items-center">
      <Logo className="h-12 w-12 mb-4 text-primary" />
      <CardHeader className="text-center p-0 mb-6">
        <CardTitle className="font-headline text-3xl">{t('login.title')}</CardTitle>
        <CardDescription>{t('login.subtitle')}</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin} className="w-full space-y-6">
        <RadioGroup value={role} onValueChange={(value: UserRole) => setRole(value)} className="grid grid-cols-1 gap-4">
          {roles.map(({ id, label, icon: Icon }) => (
            <Label
              key={id}
              htmlFor={id}
              className={`flex items-center space-x-3 rounded-md border-2 p-4 transition-all hover:bg-accent/10 ${
                role === id ? 'border-primary shadow-md' : 'border-border'
              }`}
            >
              <RadioGroupItem value={id} id={id} className="sr-only" />
              <Icon className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">{label}</span>
            </Label>
          ))}
        </RadioGroup>
        <Button type="submit" className="w-full text-lg h-12 font-bold bg-accent hover:bg-accent/90">
          {t('login.button', role)}
        </Button>
      </form>
    </div>
  );
}
