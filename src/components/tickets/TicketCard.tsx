
"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, User, CalendarDays, Tag, Info, Loader2, AlertTriangle, Coins, Printer, X } from 'lucide-react';
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
  const [isPrinting, setIsPrinting] = useState(false);

  const [ticketImageSrc, setTicketImageSrc] = useState<string>(ticket.imageUrl);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fullScreenImageSrc, setFullScreenImageSrc] = useState<string | null>(null);


  const fetchAndSetActualImage = useCallback(async (currentBizonylatId: string): Promise<string> => {
    if (!username || !mavToken) {
        setTicketImageSrc(ticket.imageUrl);
        setImageLoading(false);
        setImageError("Authentication details missing.");
        return ticket.imageUrl;
    }

    setImageLoading(true);
    setImageError(null);
    
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
        const newImageSrc = `data:image/jpeg;base64,${successResult.jegykep}`;
        setTicketImageSrc(newImageSrc);
        return newImageSrc;
    } catch (err) {
        console.error(`Error fetching ticket image for ${currentBizonylatId}:`, err);
        const errorMessage = err instanceof Error ? err.message : "Could not load ticket image.";
        setImageError(errorMessage);
        if (!ticketImageSrc.startsWith('data:image/jpeg')) {
            setTicketImageSrc(ticket.imageUrl);
        }
        throw err;
    } finally {
        setImageLoading(false);
    }
  }, [username, mavToken, ticket.imageUrl, ticketImageSrc]);


  useEffect(() => {
    const currentBizonylatId = ticket.bizonylatAzonosito;
    if (!currentBizonylatId) {
        setTicketImageSrc(ticket.imageUrl);
        setImageLoading(false);
        setImageError(null);
        return;
    }
    if (ticketImageSrc === ticket.imageUrl || !ticketImageSrc.startsWith('data:image/jpeg')) {
        fetchAndSetActualImage(currentBizonylatId).catch(() => {
            // Error is handled within fetchAndSetActualImage
        });
    }
  }, [ticket.bizonylatAzonosito, ticket.imageUrl, fetchAndSetActualImage, ticketImageSrc]);

  const getTicketImageDataUri = async (): Promise<string> => {
    if (ticketImageSrc.startsWith('data:image/jpeg')) {
      return ticketImageSrc;
    }
    return fetchAndSetActualImage(ticket.bizonylatAzonosito);
  };
  

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
      const imageToDownload = await getTicketImageDataUri();
      
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

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const imageDataUri = await getTicketImageDataUri();
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Ticket - ${ticket.ticketName}</title>
              <style>
                @page { 
                  size: auto; 
                  margin: 10mm; 
                }
                body { 
                  margin: 0; 
                  padding: 0; 
                  display: flex; 
                  justify-content: center; 
                  align-items: flex-start; 
                }
                img { 
                  width: 8.2cm; 
                  max-width: 100%; 
                  height: auto; 
                  display: block; 
                }
                @media print {
                  body { display: block; margin: 0; padding: 0; } 
                  img { margin: 0 auto; }
                }
              </style>
            </head>
            <body>
              <img src="${imageDataUri}" alt="Ticket for ${ticket.passengerName} - ${ticket.ticketName}" onload="setTimeout(() => { window.print(); window.close(); }, 200);" />
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        toast({
          variant: "destructive",
          title: "Print Error",
          description: "Could not open a new window for printing. Please check your browser's pop-up blocker settings.",
        });
      }
    } catch (error) {
      console.error("Print error:", error);
      toast({
        variant: "destructive",
        title: "Print Failed",
        description: error instanceof Error ? error.message : "Could not prepare ticket for printing.",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleImageClick = async () => {
    if (imageError && !ticketImageSrc.startsWith('data:image/jpeg')) {
      toast({
        variant: "destructive",
        title: "Cannot Enlarge",
        description: "The ticket image could not be loaded. Please try refreshing or check the error icon.",
      });
      return;
    }

    if (ticketImageSrc.startsWith('data:image/jpeg')) {
      setFullScreenImageSrc(ticketImageSrc);
      setIsFullScreen(true);
    } else {
      // Attempt to fetch if not already a data URI, might show loader temporarily in fullscreen
      setImageLoading(true); // Indicate loading for fullscreen purposes
      try {
        const imageToDisplay = await fetchAndSetActualImage(ticket.bizonylatAzonosito);
        setFullScreenImageSrc(imageToDisplay);
        setIsFullScreen(true);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error Enlarging Image",
          description: "Could not load the full ticket image. Please check the error on the card or try again.",
        });
      } finally {
        setImageLoading(false); // Reset card-level image loading if it was set
      }
    }
  };


  const formatDate = (timestamp: number) => {
    if (!timestamp) return "N/A";
    return format(new Date(timestamp * 1000), 'MMM d, yyyy');
  };

  let imageElement;
  if (imageLoading && !ticketImageSrc.startsWith('data:image/jpeg')) {
    imageElement = <Loader2 className="h-10 w-10 animate-spin text-primary my-10" />;
  } else if (imageError && !ticketImageSrc.startsWith('data:image/jpeg')) {
    imageElement = (
      <div className="text-center p-4 flex flex-col items-center justify-center text-destructive">
        <AlertTriangle className="h-10 w-10 mb-2" />
        <p className="text-sm font-semibold">Image Error</p>
        <p className="text-xs max-w-full truncate" title={imageError}>{imageError.substring(0,100)}</p>
      </div>
    );
  } else if (ticketImageSrc && (ticketImageSrc.startsWith('data:image/jpeg') || ticketImageSrc === ticket.imageUrl) ) {
    imageElement = (
      <Image
        src={ticketImageSrc}
        alt={`Ticket for ${ticket.ticketName}`}
        width={ticketImageSrc.startsWith('data:image/jpeg') ? 720 : 300}
        height={ticketImageSrc.startsWith('data:image/jpeg') ? 1000 : 500}
        className="object-contain w-full h-auto max-h-[450px]"
        data-ai-hint={aiHint || "train ticket travel"}
        priority={false}
      />
    );
  } else {
     imageElement = <Loader2 className="h-10 w-10 animate-spin text-primary my-10" />;
  }


  return (
    <>
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col bg-card">
        <CardHeader className="p-0 relative">
          <div
            className="w-full bg-muted flex items-center justify-center min-h-[250px] rounded-t-lg overflow-hidden cursor-pointer"
            onClick={handleImageClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleImageClick(); }}
            aria-label={`Enlarge ticket image for ${ticket.ticketName}`}
          >
            {imageElement}
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col justify-end">
          <div>
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
          <div className="flex flex-row md:flex-col xl:flex-row w-full gap-2">
              <Button
                onClick={handleDownload}
                className="flex-1"
                aria-label={`Download ticket for ${ticket.ticketName}`}
                disabled={isDownloading || isPrinting || imageLoading || (imageError && !ticketImageSrc.startsWith('data:image/jpeg'))}
              >
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {isDownloading ? 'Downloading...' : 'Download'}
              </Button>
              <Button
                onClick={handlePrint}
                className="flex-1"
                variant="outline"
                aria-label={`Print ticket for ${ticket.ticketName}`}
                disabled={isPrinting || isDownloading || imageLoading || (imageError && !ticketImageSrc.startsWith('data:image/jpeg'))}
              >
                {isPrinting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Printer className="mr-2 h-4 w-4" />
                )}
                {isPrinting ? 'Printing...' : 'Print'}
              </Button>
          </div>
        </CardFooter>
      </Card>

      {isFullScreen && fullScreenImageSrc && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setIsFullScreen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`fullscreen-ticket-title-${ticket.id}`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFullScreen(false);
            }}
            className="absolute top-4 right-4 z-[101] text-white bg-black/60 rounded-full p-2 hover:bg-black/80 transition-colors"
            aria-label="Close fullscreen image"
          >
            <X className="h-6 w-6" />
          </button>
          <div
            className="relative max-w-full max-h-full overflow-auto"
            onClick={(e) => e.stopPropagation()} 
          >
            <h2 id={`fullscreen-ticket-title-${ticket.id}`} className="sr-only">
              Fullscreen Ticket: {ticket.ticketName} for {ticket.passengerName}
            </h2>
            <img
              src={fullScreenImageSrc}
              alt={`Fullscreen ticket for ${ticket.ticketName} - ${ticket.passengerName}`}
              className="block max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}

    
