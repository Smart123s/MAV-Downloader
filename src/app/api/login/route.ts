
import { type NextRequest, NextResponse } from 'next/server';
import type { MavLoginRequestPayload, MavLoginSuccessResponse, MavLoginErrorResponse, MavUzenet } from '@/types/mav-api';

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

    // Check for MÁV logical errors even if HTTP status is 200
    const errorDetails = responseData as MavLoginErrorResponse;
    if (errorDetails.Uzenetek && errorDetails.Uzenetek.length > 0 && errorDetails.Uzenetek[0].Szoveg) {
      return NextResponse.json({ message: errorDetails.Uzenetek[0].Szoveg }, { status: 401 }); // 401 for bad credentials
    }

    // Handle other MÁV API errors (non-200 status codes)
    if (!mavResponse.ok) {
      let errorMessage = `MAV API Error: ${mavResponse.statusText || mavResponse.status}`;
      // Attempt to get a more specific message if Uzenetek was not the primary error source but present
      if (errorDetails.Message) {
        errorMessage = errorDetails.Message;
      }
      return NextResponse.json({ message: errorMessage }, { status: mavResponse.status });
    }

    // Handle successful login
    const successData = responseData as MavLoginSuccessResponse;
    if (successData.Token) {
      return NextResponse.json({
        token: successData.Token,
        username: username,
        expiresAt: successData.ErvenyessegVege,
      }, { status: 200 });
    } else {
      // Fallback for unexpected responses that are HTTP 200 but don't have Token or Uzenetek errors
      return NextResponse.json({ message: 'Login failed: Unexpected response structure from MÁV API.' }, { status: 500 });
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
