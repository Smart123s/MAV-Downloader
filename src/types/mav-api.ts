
export interface MavLoginRequestPayload {
  FelhasznaloAzonosito: string;
  Jelszo: string;
  Nyelv: "HU";
  UAID: string;
}

export interface MavDokumentum {
  DokumentumKod: string;
  Nyelv: string;
  Verzio: number;
  HtmlUrl: string;
  PdfUrl: string;
  ErvKezd: number;
  HtmlValtozasKovetettUrl: string;
}

export interface MavLoginSuccessResponse {
  Token: string;
  ErvenyessegVege: number;
  ElfogadandoDoksik: MavDokumentum[];
}

export interface MavUzenet {
  ID: string;
  Tipus: string;
  Szoveg: string;
}

export interface MavLoginErrorResponse {
  Message?: string; // Keep for potential fallback or other error types
  Uzenetek?: MavUzenet[];
}

// Types for MegrendelesKereses (Order Search)
export interface MavMegrendelesKeresesRequestPayload {
  Ervenyes: boolean;
  FelhasznaloAzonosito: string;
  Token: string;
  Nyelv: "HU";
  UAID: string;
}

export interface MavJegy {
  Nev: string;
  Kedvezmeny?: string;
  ErvKezd: number;
  ErvVeg: number;
  SzolgaltatasAzonosito: string;
  UtazasIranya: string;
  Allapot: string;
  Ar: number;
  BerletJel: boolean;
  SzolgaltatasAllapot: string;
  TetelAzonosito: string;
}

export interface MavJegykepAdat {
  UtasNeve: string;
  SzuletesiDatum?: number; 
  Jegysorszam: string;
  BizonylatAzonosito: string;
  Jegyek: MavJegy[];
}

export interface MavBerletTok {
  HPTAzonosito: string;
  NevesitesAzonosito: string;
  VerzioSzam: number;
  Tipus: string;
}

export interface MavMegrendeles {
  MegrendelesAzonosito: string;
  VasarlasDatuma: number;
  CsoportAzon: string;
  BerletTok?: MavBerletTok; 
  JegykepAdatok: MavJegykepAdat[];
  AtvetMod: string;
}

export interface MavMegrendelesKeresesSuccessResponse {
  Megrendelesek: MavMegrendeles[];
}

export interface MavMegrendelesKeresesErrorResponse {
  Message?: string;
}

// Type for our backend API response for tickets list
export interface DisplayableTicket {
  id: string;
  orderId: string;
  ticketKey: string; 
  passengerName: string;
  ticketName: string;
  discount?: string;
  validFrom: number;
  validTo: number;
  price: number;
  status: string;
  imageUrl: string; 
  bizonylatAzonosito: string;
  jegysorszam: string;
  tetelAzonosito: string;
}

// Types for GetJegykep (Get Ticket Image)
export interface MavGetJegykepRequestPayload {
  FelhasznaloAzonosito: string;
  BizonylatAzonosito: string[]; // MAV API expects an array
  Token: string;
  Nyelv: "HU";
  UAID: string;
}

export interface MavBizonylat {
  BizonylatFajta: string;
  BizonylatTechnikaiAzonosito: string; // This should match the requested BizonylatAzonosito
  Jegysorszam: string;
  Jegykep: string; // base64 encoded jpeg
}

export interface MavGetJegykepSuccessResponse {
  Bizonylatok: MavBizonylat[];
}

export interface MavGetJegykepErrorResponse {
  Message?: string;
}

// Type for our backend API request to fetch a single ticket image
export interface AppGetTicketImageRequestPayload {
  username: string;
  token: string;
  bizonylatAzonosito: string;
}

// Type for our backend API response for a single ticket image
export interface AppGetTicketImageSuccessResponse {
  bizonylatAzonosito: string;
  jegykep: string; // base64 encoded jpeg
  jegysorszam: string;
  bizonylatFajta: string;
}

export interface AppGetTicketImageErrorResponse {
    message: string;
    rawError?: any;
}
