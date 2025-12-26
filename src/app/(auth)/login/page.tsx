import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="shadow-2xl">
      <CardContent className="p-8">
        <LoginForm />
      </CardContent>
    </Card>
  );
}
