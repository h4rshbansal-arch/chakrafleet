import { RegistrationForm } from "@/components/auth/registration-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <Card className="shadow-2xl">
       <CardHeader className="p-8 pb-4 text-center">
        <CardTitle className="font-headline text-3xl">Create an Account</CardTitle>
        <CardDescription>Fill out the form below to get started.</CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <RegistrationForm />
         <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
