
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Ticket {
  id: string;
  name: string;
  imageUrl: string;
  downloadUrl: string;
}

interface TicketCardProps {
  ticket: Ticket;
  "data-ai-hint"?: string;
}

export default function TicketCard({ ticket, "data-ai-hint": aiHint }: TicketCardProps) {
  const { toast } = useToast();

  const handleDownload = () => {
    // In a real app, this might involve a service call or a more complex download logic.
    // For now, we'll use a simple anchor download.
    const link = document.createElement('a');
    link.href = ticket.downloadUrl;
    // Suggest a filename. The actual filename might be determined by server headers.
    link.download = `${ticket.name.replace(/\s+/g, '_')}_ticket.png`; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download Started",
      description: `Downloading ${ticket.name}.`,
      className: "bg-accent text-accent-foreground" // Using accent for success as requested
    });
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0">
        <div className="aspect-[3/5] w-full relative">
          <Image
            src={ticket.imageUrl}
            alt={`Ticket for ${ticket.name}`}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={aiHint || "ticket travel"}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-lg leading-tight mb-2 truncate" title={ticket.name}>
          {ticket.name}
        </CardTitle>
        {/* Additional ticket details could go here */}
      </CardContent>
      <CardFooter className="p-4">
        <Button onClick={handleDownload} className="w-full" aria-label={`Download ticket for ${ticket.name}`}>
          <Download className="mr-2 h-4 w-4" />
          Download Ticket
        </Button>
      </CardFooter>
    </Card>
  );
}
