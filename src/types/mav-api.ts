
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

export interface MavLoginErrorResponse {
  Message?: string;
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
  SzuletesiDatum?: number; // Optional as per example, but good to have
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
  BerletTok?: MavBerletTok; // Optional as per example
  JegykepAdatok: MavJegykepAdat[];
  AtvetMod: string;
}

export interface MavMegrendelesKeresesSuccessResponse {
  Megrendelesek: MavMegrendeles[];
}

export interface MavMegrendelesKeresesErrorResponse {
  Message?: string;
  // Define other potential error fields if known
}

// Type for our backend API response for tickets
export interface DisplayableTicket {
  id: string;
  orderId: string;
  ticketKey: string; // Combination of BizonylatAzonosito and Jegysorszam for GetJegykep
  passengerName: string;
  ticketName: string;
  discount?: string;
  validFrom: number;
  validTo: number;
  price: number;
  status: string;
  imageUrl: string;
  downloadUrl: string;
  bizonylatAzonosito: string;
  jegysorszam: string;
  tetelAzonosito: string;
}
