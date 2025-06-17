
"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, User, CalendarDays, Tag, Info, Loader2, AlertTriangle, Coins } from 'lucide-react';
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

  const [ticketImageSrc, setTicketImageSrc] = useState<string>(ticket.imageUrl);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    const currentBizonylatId = ticket.bizonylatAzonosito;

    const fetchImage = async () => {
        if (!currentBizonylatId || !username || !mavToken) {
            setTicketImageSrc(ticket.imageUrl); // Fallback to placeholder
            setImageLoading(false);
            setImageError(null);
            return;
        }

        setImageLoading(true);
        setImageError(null);
        
        if (ticketImageSrc !== ticket.imageUrl && !ticketImageSrc.startsWith('data:image/jpeg')) {
             setTicketImageSrc(ticket.imageUrl);
        }


        try {
            const response = await fetch('/api/ticket-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    token: mavToken,
                    bizonylatAzonosito: currentBizonylatId,
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error((result as AppGetTicketImageErrorResponse).message || `Failed to fetch image (HTTP ${response.status})`);
            }
            const successResult = result as AppGetTicketImageSuccessResponse;
            setTicketImageSrc(`data:image/jpeg;base64,${successResult.jegykep}`);
        } catch (err) {
            console.error(`Error fetching ticket image for ${currentBizonylatId}:`, err);
            setImageError(err instanceof Error ? err.message : "Could not load ticket image.");
            if (!ticketImageSrc.startsWith('data:image/jpeg')) { 
                setTicketImageSrc(ticket.imageUrl);
            }
        } finally {
            setImageLoading(false);
        }
    };

    fetchImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket.bizonylatAzonosito, ticket.imageUrl, username, mavToken]); 

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
      let imageToDownload = ticketImageSrc.startsWith('data:image/jpeg') ? ticketImageSrc : null;

      if (!imageToDownload) {
        const response = await fetch('/api/ticket-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            token: mavToken,
            bizonylatAzonosito: ticket.bizonylatAzonosito,
          }),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error((result as AppGetTicketImageErrorResponse).message || `Failed to download ticket (HTTP ${response.status})`);
        }
        imageToDownload = `data:image/jpeg;base64,${(result as AppGetTicketImageSuccessResponse).jegykep}`;
      }
      
      const link = document.createElement('a');
      link.href = imageToDownload;
      link.download = `${ticket.ticketName.replace(/\s+/g, '_')}_${ticket.passengerName.replace(/\s+/g, '_')}_${ticket.jegysorszam}.jpeg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

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

  let imageElement;
  if (imageLoading) {
    imageElement = <Loader2 className="h-10 w-10 animate-spin text-primary my-10" />;
  } else if (imageError) {
    imageElement = (
      <div className="text-center p-4 flex flex-col items-center justify-center text-destructive">
        <AlertTriangle className="h-10 w-10 mb-2" />
        <p className="text-sm font-semibold">Image Error</p>
        <p className="text-xs max-w-full truncate" title={imageError}>{imageError.substring(0,100)}</p>
      </div>
    );
  } else if (ticketImageSrc && ticketImageSrc.startsWith('data:image/jpeg')) {
    imageElement = (
      <Image
        src={ticketImageSrc}
        alt={`Ticket for ${ticket.ticketName}`}
        width={720} 
        height={1000} 
        className="object-contain w-full h-auto max-h-[450px] rounded-t-lg"
        priority={false} 
      />
    );
  } else { 
    imageElement = (
      <Image
        src={ticketImageSrc} 
        alt={`Placeholder for ${ticket.ticketName}`}
        width={300} 
        height={500} 
        className="object-cover w-full h-auto max-h-[450px] rounded-t-lg"
        data-ai-hint={aiHint || "train ticket travel"}
        priority={false}
      />
    );
  }

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col bg-card">
      <CardHeader className="p-0 relative">
        <div className="w-full bg-muted flex items-center justify-center min-h-[250px] rounded-t-lg overflow-hidden">
          {imageElement}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col justify-end">
        <div> {/* Wrapper for title and details to be pushed to bottom */}
          <div className="flex justify-between items-start mb-3">
            <CardTitle className="font-headline text-lg leading-tight truncate mr-2" title={ticket.ticketName}>
              {ticket.ticketName}
            </CardTitle>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-1.5">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> 
              <span>{ticket.passengerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span>{formatDate(ticket.validFrom)} - {formatDate(ticket.validTo)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              <span>{ticket.price} HUF</span>
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
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button 
          onClick={handleDownload} 
          className="w-full" 
          aria-label={`Download ticket for ${ticket.ticketName}`}
          disabled={isDownloading || imageLoading} 
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

