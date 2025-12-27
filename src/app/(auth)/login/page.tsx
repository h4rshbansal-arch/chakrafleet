import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Card className="shadow-2xl">
      <CardHeader className="p-8 pb-4 text-center">
        <CardTitle className="font-headline text-3xl">Welcome to ChakraFleet</CardTitle>
        <CardDescription>Enter your credentials to access your account.</CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <LoginForm />
        <div className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
