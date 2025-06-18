
import { type NextRequest, NextResponse } from 'next/server';
import type { MavLoginRequestPayload, MavLoginSuccessResponse, MavLoginErrorResponse } from '@/types/mav-api';

const MAV_API_URL = 'https://vim.mav-start.hu/VIM/PR/20240320/MobileServiceS.svc/rest/Bejelentkezes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    const mavPayload: MavLoginRequestPayload = {
      FelhasznaloAzonosito: username,
      Jelszo: password,
      Nyelv: "HU",
      UAID: "0-0ecpn803G72T1ztcxi2BEDDr786d", 
    };

    const mavResponse = await fetch(MAV_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(mavPayload),
    });

    const responseData = await mavResponse.json();

    if (!mavResponse.ok) {
      const errorResponseData = responseData as MavLoginErrorResponse;
      let errorMessage = `MAV API Error: ${mavResponse.statusText || mavResponse.status}`;

      if (errorResponseData.Uzenetek && errorResponseData.Uzenetek.length > 0 && errorResponseData.Uzenetek[0].Szoveg) {
        errorMessage = errorResponseData.Uzenetek[0].Szoveg;
      } else if (errorResponseData.Message) {
        errorMessage = errorResponseData.Message;
      }
      
      return NextResponse.json({ message: errorMessage }, { status: mavResponse.status });
    }

    const successData = responseData as MavLoginSuccessResponse;
    if (successData.Token) {
      return NextResponse.json({
        token: successData.Token,
        username: username,
        expiresAt: successData.ErvenyessegVege,
      }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Login failed: Unexpected response from MÁV API.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Login API route error:', error);
    let message = 'Internal Server Error';
    if (error instanceof Error) {
        message = error.message;
    }
    return NextResponse.json({ message }, { status: 500 });
  }
}
