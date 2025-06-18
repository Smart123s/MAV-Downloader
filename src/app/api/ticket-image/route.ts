
import { type NextRequest, NextResponse } from 'next/server';
import type { 
  AppGetTicketImageRequestPayload,
  MavGetJegykepRequestPayload,
  MavGetJegykepSuccessResponse,
  MavGetJegykepErrorResponse,
  AppGetTicketImageSuccessResponse,
  AppGetTicketImageErrorResponse
} from '@/types/mav-api';
import { ثابت_UAID } from '@/lib/constants';
import { isRateLimited } from '@/lib/rate-limiter';

const MAV_API_JEGYKEP_URL = 'https://vim.mav-start.hu/VIM/PR/20240320/MobileServiceS.svc/rest/GetJegykep';

export async function POST(request: NextRequest) {
  if (isRateLimited()) {
    return NextResponse.json(
      { message: 'Too Many Requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body: AppGetTicketImageRequestPayload = await request.json();
    const { username, token, bizonylatAzonosito } = body;

    if (!username || !token || !bizonylatAzonosito) {
      return NextResponse.json({ message: 'Username, token, and bizonylatAzonosito are required' }, { status: 400 });
    }

    const mavPayload: MavGetJegykepRequestPayload = {
      FelhasznaloAzonosito: username,
      BizonylatAzonosito: [bizonylatAzonosito],
      Token: token,
      Nyelv: "HU",
      UAID: ثابت_UAID,
    };

    const mavResponse = await fetch(MAV_API_JEGYKEP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(mavPayload),
    });

    const responseData = await mavResponse.json();

    if (!mavResponse.ok) {
      const errorMessage = (responseData as MavGetJegykepErrorResponse)?.Message || `MAV API Error: ${mavResponse.statusText || mavResponse.status}`;
      const errorResponse: AppGetTicketImageErrorResponse = { message: errorMessage, rawError: responseData };
      return NextResponse.json(errorResponse, { status: mavResponse.status });
    }
    
    const successData = responseData as MavGetJegykepSuccessResponse;

    if (successData.Bizonylatok && successData.Bizonylatok.length > 0) {
      const ticketImageInfo = successData.Bizonylatok.find(b => b.BizonylatTechnikaiAzonosito === bizonylatAzonosito);
      if (ticketImageInfo) {
        const apiResponse: AppGetTicketImageSuccessResponse = {
            bizonylatAzonosito: ticketImageInfo.BizonylatTechnikaiAzonosito,
            jegykep: ticketImageInfo.Jegykep,
            jegysorszam: ticketImageInfo.Jegysorszam,
            bizonylatFajta: ticketImageInfo.BizonylatFajta,
        };
        return NextResponse.json(apiResponse, { status: 200 });
      } else {
        const errorResponse: AppGetTicketImageErrorResponse = { message: 'Ticket image not found for the provided BizonylatAzonosito.', rawError: successData };
        return NextResponse.json(errorResponse, { status: 404 });
      }
    } else {
      const errorResponse: AppGetTicketImageErrorResponse = { message: 'No ticket images found in MAV API response or unexpected structure.', rawError: successData };
      return NextResponse.json(errorResponse, { status: 500 });
    }

  } catch (error) {
    console.error('Fetch ticket image API route error:', error);
    let message = 'Internal Server Error fetching ticket image';
    if (error instanceof Error) {
        message = error.message;
    }
    const errorResponse: AppGetTicketImageErrorResponse = { message };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
