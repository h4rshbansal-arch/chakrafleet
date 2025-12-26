import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="shadow-2xl">
      <CardHeader className="p-8 pb-4 text-center">
        <CardTitle className="font-headline text-3xl">Welcome to EZTransport</CardTitle>
        <CardDescription>Enter your credentials to access your account.</CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <LoginForm />
      </CardContent>
    </Card>
  );
}
