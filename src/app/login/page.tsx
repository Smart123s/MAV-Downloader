
import LoginForm from '@/components/auth/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketIcon } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="items-center text-center">
          <TicketIcon className="h-16 w-16 text-primary mb-4" />
          <CardTitle className="font-headline text-3xl">Welcome Back!</CardTitle>
          <CardDescription>Log in to access your MÁV tickets.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Ticket Downloader &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
}
