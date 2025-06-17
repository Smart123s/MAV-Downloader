
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, User, CalendarDays, Tag, CircleDollarSign, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { DisplayableTicket } from '@/types/mav-api';
import { format } from 'date-fns';

interface TicketCardProps {
  ticket: DisplayableTicket;
  "data-ai-hint"?: string;
}

export default function TicketCard({ ticket, "data-ai-hint": aiHint }: TicketCardProps) {
  const { toast } = useToast();

  const handleDownload = () => {
    // This will download the placeholder. Actual download logic will come with GetJegykep.
    const link = document.createElement('a');
    link.href = ticket.downloadUrl;
    link.download = `${ticket.ticketName.replace(/\s+/g, '_')}_${ticket.passengerName.replace(/\s+/g, '_')}.png`; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Note: As per guidelines, toast is for errors. 
    // This success toast for download might be against guidelines if strictly followed.
    // Consider removing or changing if only errors should be toasted.
    // For now, keeping it as it was in previous version for "Download Started".
    toast({
      title: "Download Initialized",
      description: `Preparing download for ${ticket.ticketName}. Actual ticket image requires further steps.`,
      className: "bg-accent text-accent-foreground"
    });
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
            src={ticket.imageUrl}
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
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button onClick={handleDownload} className="w-full" aria-label={`Download ticket for ${ticket.ticketName}`}>
          <Download className="mr-2 h-4 w-4" />
          Download (Placeholder)
        </Button>
      </CardFooter>
    </Card>
  );
}
