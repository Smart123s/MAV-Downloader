
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/layout/Header';
import TicketCard from '@/components/tickets/TicketCard';
import { Loader2, AlertTriangle, Ticket as TicketIconSvg, Github } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { DisplayableTicket } from '@/types/mav-api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TicketsPage() {
  const router = useRouter();
  const { username, mavToken, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const [tickets, setTickets] = useState<DisplayableTicket[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    if (!username || !mavToken) {
      setError("User authentication data is missing.");
      setPageLoading(false);
      return;
    }

    setPageLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, token: mavToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to fetch tickets (HTTP ${response.status})`);
      }
      
      if (Array.isArray(data)) {
        setTickets(data);
      } else if (data.message && data.rawResponse && Array.isArray(data.rawResponse.Megrendelesek) && data.rawResponse.Megrendelesek.length === 0) {
        setTickets([]); // No tickets found, but API call was successful in a way
      }
      else {
        // This case handles where data is not an array and not the "no tickets found" message.
        console.warn("Received unexpected data structure for tickets:", data);
        setTickets([]); 
        setError(data.message || "Received unexpected data structure for tickets.");
      }

    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while fetching tickets.");
      setTickets([]); // Clear tickets on error
    } finally {
      setPageLoading(false);
    }
  }, [username, mavToken]);


  useEffect(() => {
    if (!authIsLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        fetchTickets();
      }
    }
  }, [isAuthenticated, authIsLoading, router, fetchTickets]);


  if (authIsLoading || (isAuthenticated && pageLoading && tickets.length === 0 && !error)) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto py-8 px-4 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
         <footer className="py-6 text-center text-sm text-muted-foreground">
           <p className="mb-2">This application is not affiliated with MÁV-START&nbsp;Zrt. or MÁV&nbsp;Zrt.</p>
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

  if (!isAuthenticated && !authIsLoading) {
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-headline text-4xl font-bold text-foreground">Your Tickets</h1>
          <Button onClick={fetchTickets} disabled={pageLoading}>
            {pageLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Refresh Tickets
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Tickets</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!pageLoading && !error && tickets.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <TicketIconSvg className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground font-semibold">No tickets found.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try refreshing, or check your MÁV account if you were expecting tickets.
            </p>
          </div>
        )}

        {tickets.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tickets.map((ticket) => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                data-ai-hint="train ticket" 
              />
            ))}
          </div>
        )}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
         <p className="mb-2">This application is not affiliated with MÁV-START&nbsp;Zrt. or MÁV&nbsp;Zrt.</p>
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
