export type EventVisibility =
  | { scope: "team"; teamId: string }
  | { scope: "personal"; ownerUserId: string };

export type AttachmentType = "image" | "pdf" | "doc" | "other";

export type Attachment = {
  id: string;

  // Simple category you already use (keep this)
  type: AttachmentType;

  // Add this so the app can accurately detect images/pdf/etc
  // Examples: "image/png", "image/jpeg", "application/pdf"
  mimeType?: string;

  url: string;        // storage URL (https://...)
  fileName: string;

  // Optional but handy
  sizeBytes?: number;

  uploadedBy: string; // userId
  createdAt: string;  // ISO
};

export type EventAlert = {
  id: string;
  minutesBefore: number;
  enabled: boolean;
};

export type EventLocation = {
  name?: string;
  address?: string; // <- changed to optional (some events may only have a name)
  lat?: number;
  lng?: number;
};

export type TeamEventKind = "practice" | "tournament" | "games" | "meeting" | "other";

export type TeamEvent = {
  id: string;
  kind: TeamEventKind;

  title: string;
  description?: string;

  location?: EventLocation;

  startAt: string;   // ISO datetime
  endAt?: string;
  allDay?: boolean;

  tags?: string[];
  extra?: Record<string, any>;

  attachments?: Attachment[];

  alerts: EventAlert[];
  timezone?: string;

  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt?: string;

  visibility: { scope: "team"; teamId: string };
};

export type PersonalEvent = {
  id: string;
  title: string;
  description?: string;

  location?: EventLocation;

  startAt: string;
  endAt?: string;
  allDay?: boolean;

  availability?: "available" | "maybe" | "unavailable";
  shareWithTeamStaff?: boolean;

  attachments?: Attachment[];
  alerts: EventAlert[];

  timezone?: string;

  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;

  visibility: { scope: "personal"; ownerUserId: string };
};
