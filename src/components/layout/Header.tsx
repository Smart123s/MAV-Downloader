
"use client";

import Link from 'next/link';
import { TicketIcon } from 'lucide-react';
import UserNav from './UserNav';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/tickets" className="flex items-center gap-2" aria-label="MÁV Downloader Home">
          <TicketIcon className="h-8 w-8 text-primary" />
          <span className="font-headline text-xl font-semibold text-primary">MÁV Downloader</span>
        </Link>
        <UserNav />
      </div>
    </header>
  );
}

