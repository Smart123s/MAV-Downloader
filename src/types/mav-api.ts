
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
  // Define other potential error fields from MAV API if known
}
