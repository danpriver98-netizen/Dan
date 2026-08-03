// ─────────────────────────────────────────────────────────────
// Core domain types for the Real-Estate 360° CRM
// ─────────────────────────────────────────────────────────────

export type ContactType = "seller" | "buyer" | "renter";

export type PipelineStage = "active" | "nurturing" | "past_client";

export type SeriousnessLevel = "hot" | "warm" | "cold";

export interface Tag {
  id: string;
  label: string; // e.g. "#BigBalcony"
  color: string; // tailwind-ish token
  kind: "physical" | "financial" | "behavioral" | "location" | "custom";
}

export interface Contact {
  id: string;
  type: ContactType;
  name: string;
  phone: string;
  email?: string;
  city: string;
  stage: PipelineStage;
  seriousness: SeriousnessLevel;
  source: string; // Facebook / Yad2 / Sign / Referral
  tags: string[]; // tag ids
  dncFlagged: boolean; // Do-Not-Call registry hit
  createdAt: string;
  lastContactedAt?: string;
  notes?: string;

  // Buyer / renter preferences
  budgetMin?: number;
  budgetMax?: number;
  preferredCities?: string[];
  desiredTags?: string[]; // tag ids they want in a property
  rooms?: number;

  // Renter lifecycle
  leaseStartDate?: string;
  leaseEndDate?: string;

  // Seller linkage
  propertyId?: string;
}

export type PropertyStatus =
  | "active"
  | "under_offer"
  | "sold"
  | "rented"
  | "archived";

export type ListingOrigin = "internal" | "proptech_feed";

export interface Property {
  id: string;
  code: string; // "Name Bot" lookup code e.g. "BY-PENT-04"
  title: string;
  address: string;
  city: string;
  status: PropertyStatus;
  origin: ListingOrigin;
  askingPrice: number;
  rooms: number;
  sizeSqm: number;
  exclusive: boolean;
  tags: string[]; // tag ids
  sellerId?: string;
  image: string;
  // brochure assets ("Name Bot")
  brochure: {
    tabuDeed: boolean;
    municipalTax: boolean;
    floorPlan: boolean;
    virtualTour: boolean;
    comparables: boolean;
  };
  createdAt: string;
  soldPrice?: number;
  commissionRate?: number; // percent
}

export type MessageTemplateCategory =
  | "marketing"
  | "utility"
  | "authentication";

export interface MessageTemplate {
  id: string;
  name: string;
  category: MessageTemplateCategory;
  language: string;
  body: string; // supports {{1}} {{name}} variables
  status: "approved" | "pending" | "rejected";
}

export interface CallLog {
  id: string;
  contactId: string;
  direction: "inbound" | "outbound";
  durationSec: number;
  timestamp: string;
  recordingUrl: string; // mock cloud PBX recording
  dncChecked: boolean;
  outcome: "connected" | "no_answer" | "voicemail";
}

export interface MarketingExpense {
  id: string;
  propertyId: string;
  category: "facebook_ads" | "photography" | "signage" | "staging" | "other";
  label: string;
  amount: number;
  date: string;
}

export interface Cheque {
  id: string;
  propertyId?: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: "pending" | "cleared" | "bounced";
  direction: "incoming" | "outgoing";
}

export type TaskStatus = "pending" | "done" | "rolled_over";

export interface AgendaTask {
  id: string;
  title: string;
  contactId?: string;
  dueDate: string; // ISO date (yyyy-mm-dd)
  status: TaskStatus;
  rolledFrom?: string; // original date if rolled over
  priority: "high" | "medium" | "low";
  syncedToCalendar: boolean;
}

export type RsvpStatus = "pending" | "confirmed" | "cancelled";

export interface Appointment {
  id: string;
  propertyId: string;
  contactId: string;
  scheduledAt: string;
  status: RsvpStatus;
  wazeUrl: string;
  confirmationToken: string;
}

export interface MatchResult {
  buyer: Contact;
  property: Property;
  score: number; // 0-100
  reasons: string[];
}
