
import LoginForm from '@/components/auth/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketIcon, Github } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="items-center text-center">
          <TicketIcon className="h-16 w-16 text-primary mb-4" />
          <CardTitle className="font-headline text-3xl">MÁV Downloader</CardTitle>
          <CardDescription>Log in to access your MÁV tickets.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p className="mb-2">This application is not affiliated with MÁV&nbsp;Zrt.</p>
        <Link
          href="https://github.com/Smart123s/MAV-Downloader"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <Github className="h-4 w-4" />
          <span>View Source on GitHub</span>
        </Link>
      </footer>
    </div>
  );
}
