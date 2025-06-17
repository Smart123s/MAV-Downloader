
"use client";

import Link from 'next/link';
import { TicketIcon } from 'lucide-react';
import UserNav from './UserNav'; // Assuming UserNav handles auth state internally or via props

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/tickets" className="flex items-center gap-2" aria-label="Ticket Downloader Home">
          <TicketIcon className="h-8 w-8 text-primary" />
          <span className="font-headline text-xl font-semibold text-primary">Ticket Downloader</span>
        </Link>
        <UserNav />
      </div>
    </header>
  );
}
