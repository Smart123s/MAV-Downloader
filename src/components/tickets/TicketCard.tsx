
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, User, CalendarDays, Tag, Info, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { DisplayableTicket, AppGetTicketImageSuccessResponse, AppGetTicketImageErrorResponse } from '@/types/mav-api';
import { format } from 'date-fns';

interface TicketCardProps {
  ticket: DisplayableTicket;
  "data-ai-hint"?: string;
}

export default function TicketCard({ ticket, "data-ai-hint": aiHint }: TicketCardProps) {
  const { toast } = useToast();
  const { username, mavToken } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!username || !mavToken) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "User authentication details are missing. Please log in again.",
      });
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch('/api/ticket-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          token: mavToken,
          bizonylatAzonosito: ticket.bizonylatAzonosito,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorResult = result as AppGetTicketImageErrorResponse;
        throw new Error(errorResult.message || `Failed to download ticket image (HTTP ${response.status})`);
      }

      const successResult = result as AppGetTicketImageSuccessResponse;
      
      const link = document.createElement('a');
      link.href = `data:image/jpeg;base64,${successResult.jegykep}`;
      link.download = `${ticket.ticketName.replace(/\s+/g, '_')}_${ticket.passengerName.replace(/\s+/g, '_')}_${successResult.jegysorszam}.jpeg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Success toast for download might be against guidelines if strictly followed.
      // For now, providing a minimal success indication, as it's a key user action.
      // Consider removing if toasts are strictly for errors.
      // toast({ 
      //   title: "Download Started",
      //   description: `Ticket "${ticket.ticketName}" is downloading.`,
      //   className: "bg-accent text-accent-foreground"
      // });

    } catch (error) {
      console.error("Download error:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Could not download ticket image.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "N/A";
    return format(new Date(timestamp * 1000), 'MMM d, yyyy');
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col bg-card">
      <CardHeader className="p-0 relative">
        <div className="aspect-[3/5] w-full relative">
          <Image
            src={ticket.imageUrl} // Still using placeholder for card display
            alt={`Placeholder for ${ticket.ticketName}`}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={aiHint || "train ticket travel"}
          />
        </div>
        <div className="absolute top-2 right-2 bg-primary/80 text-primary-foreground text-xs font-semibold px-2 py-1 rounded">
          {ticket.price} HUF
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow space-y-2">
        <CardTitle className="font-headline text-lg leading-tight mb-1 truncate" title={ticket.ticketName}>
          {ticket.ticketName}
        </CardTitle>
        
        <div className="text-sm text-muted-foreground space-y-1.5">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> 
            <span>{ticket.passengerName}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span>{formatDate(ticket.validFrom)} - {formatDate(ticket.validTo)}</span>
          </div>
          {ticket.discount && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              <span>{ticket.discount}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <span>Status: {ticket.status}</span>
          </div>
           <div className="flex items-center gap-2 text-xs">
            <span>ID: {ticket.bizonylatAzonosito} / {ticket.jegysorszam}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button 
          onClick={handleDownload} 
          className="w-full" 
          aria-label={`Download ticket for ${ticket.ticketName}`}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isDownloading ? 'Downloading...' : 'Download Ticket'}
        </Button>
      </CardFooter>
    </Card>
  );
}
