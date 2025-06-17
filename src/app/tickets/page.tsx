
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/layout/Header';
import TicketCard from '@/components/tickets/TicketCard';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Ticket {
  id: string;
  name: string;
  imageUrl: string;
  downloadUrl: string; // Could be same as imageUrl or a specific download endpoint
}

// Mock ticket data
const mockTickets: Ticket[] = [
  { id: '1', name: 'Budapest - Debrecen', imageUrl: 'https://placehold.co/300x500.png', downloadUrl: 'https://placehold.co/300x500.png' },
  { id: '2', name: 'Szeged - Miskolc', imageUrl: 'https://placehold.co/300x500.png', downloadUrl: 'https://placehold.co/300x500.png' },
  { id: '3', name: 'Pécs - Győr', imageUrl: 'https://placehold.co/300x500.png', downloadUrl: 'https://placehold.co/300x500.png' },
  { id: '4', name: 'Kecskemét - Nyíregyháza', imageUrl: 'https://placehold.co/300x500.png', downloadUrl: 'https://placehold.co/300x500.png' },
];


export default function TicketsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authIsLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      // Simulate fetching tickets
      setPageLoading(true);
      setError(null);
      setTimeout(() => {
        // In a real app, you'd fetch from MAV API Integration here
        // For now, use mock data
        const shouldFail = Math.random() < 0.1; // 10% chance to simulate an error
        if (shouldFail) {
          setError("Failed to load tickets. Please try again later.");
        } else {
          setTickets(mockTickets);
        }
        setPageLoading(false);
      }, 1500);
    }
  }, [isAuthenticated]);


  if (authIsLoading || (isAuthenticated && pageLoading)) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto py-8 px-4 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    // This case should ideally be handled by the redirect, but as a fallback:
    return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-foreground">Redirecting to login...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto py-8 px-4">
        <h1 className="font-headline text-4xl font-bold mb-8 text-foreground">Your Tickets</h1>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {tickets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tickets.map((ticket, index) => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                data-ai-hint="ticket travel" 
              />
            ))}
          </div>
        ) : (
          !error && !pageLoading && (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">No tickets found.</p>
              <p className="text-sm text-muted-foreground mt-2">Try logging in again or check your MÁV account.</p>
            </div>
          )
        )}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
         Ticket Downloader &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
