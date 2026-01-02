export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export enum FormType {
  SPONSOR = "Patrocínios e Parcerias",
  SUPPORTER = "Apoiadores",
  INTEREST = "Lista de Interessados"
}

export interface InterestFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  role?: string;
  expectations?: string;
  gdpr: boolean;
}

export interface SponsorFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  companySize: string;
  message?: string;
}

export interface SupporterFormData {
  name: string;
  email: string;
  phone: string;
  area: string;
  portfolio: string;
  message: string;
}