
import { type NextRequest, NextResponse } from 'next/server';
import type { 
  MavMegrendelesKeresesRequestPayload, 
  MavMegrendelesKeresesSuccessResponse, 
  MavMegrendelesKeresesErrorResponse,
  DisplayableTicket,
  MavMegrendeles,
  MavJegykepAdat,
  MavJegy
} from '@/types/mav-api';
import { ثابت_UAID } from '@/lib/constants'; 

const MAV_API_TICKETS_URL = 'https://vim.mav-start.hu/VIM/PR/20240320/MobileServiceS.svc/rest/MegrendelesKereses';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, token } = body;

    if (!username || !token) {
      return NextResponse.json({ message: 'Username and token are required' }, { status: 400 });
    }

    const mavPayload: MavMegrendelesKeresesRequestPayload = {
      Ervenyes: true,
      FelhasznaloAzonosito: username,
      Token: token,
      Nyelv: "HU",
      UAID: ثابت_UAID,
    };

    const mavResponse = await fetch(MAV_API_TICKETS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(mavPayload),
    });

    const responseData = await mavResponse.json();

    if (!mavResponse.ok) {
      const errorMessage = (responseData as MavMegrendelesKeresesErrorResponse)?.Message || `MAV API Error: ${mavResponse.statusText || mavResponse.status}`;
      return NextResponse.json({ message: errorMessage, rawError: responseData }, { status: mavResponse.status });
    }
    
    const successData = responseData as MavMegrendelesKeresesSuccessResponse;

    if (successData.Megrendelesek) {
      const displayableTickets: DisplayableTicket[] = [];
      successData.Megrendelesek.forEach((order: MavMegrendeles) => {
        order.JegykepAdatok.forEach((ticketImageGroup: MavJegykepAdat) => {
          ticketImageGroup.Jegyek.forEach((ticketDetail: MavJegy) => {
            displayableTickets.push({
              id: `${order.MegrendelesAzonosito}-${ticketImageGroup.BizonylatAzonosito}-${ticketDetail.TetelAzonosito}`,
              orderId: order.MegrendelesAzonosito,
              ticketKey: `${ticketImageGroup.BizonylatAzonosito}_${ticketImageGroup.Jegysorszam}`,
              passengerName: ticketImageGroup.UtasNeve,
              ticketName: ticketDetail.Nev,
              discount: ticketDetail.Kedvezmeny,
              validFrom: ticketDetail.ErvKezd,
              validTo: ticketDetail.ErvVeg,
              price: ticketDetail.Ar,
              status: ticketDetail.Allapot,
              imageUrl: `https://placehold.co/300x500.png?text=${encodeURIComponent(ticketDetail.Nev.substring(0,15))}`, // Placeholder for card display
              bizonylatAzonosito: ticketImageGroup.BizonylatAzonosito,
              jegysorszam: ticketImageGroup.Jegysorszam,
              tetelAzonosito: ticketDetail.TetelAzonosito,
            });
          });
        });
      });
      return NextResponse.json(displayableTickets, { status: 200 });
    } else {
      return NextResponse.json({ message: 'No tickets found or unexpected response structure.', rawResponse: successData }, { status: 200 });
    }

  } catch (error) {
    console.error('Fetch tickets API route error:', error);
    let message = 'Internal Server Error fetching tickets';
    if (error instanceof Error) {
        message = error.message;
    }
    return NextResponse.json({ message }, { status: 500 });
  }
}
