// data/mock/teamEvents.ts
import type { TeamEvent } from "../types/events";

export const mockTeamEvents: TeamEvent[] = [
  {
    id: "evt_practice_001",
    kind: "practice",
    title: "Team Practice",
    description: "Serve/receive + scrimmage. Bring both jerseys.",
    location: {
      name: "American Sports Centers - Avondale",
      address: "755 N 114th Ave, Avondale, AZ 85323",
    },
    startAt: "2026-01-13T17:30:00-07:00",
    endAt: "2026-01-13T19:30:00-07:00",
    allDay: false,
    tags: ["indoor", "varsity"],
    extra: {
      focus: ["serve receive", "transition"],
      uniform: "practice tee",
      bring: ["knee pads", "water"],
    },
    attachments: [],
    alerts: [
      { id: "al_1", minutesBefore: 1440, enabled: true }, // 24h
      { id: "al_2", minutesBefore: 90, enabled: true }, // 1.5h
    ],
    timezone: "America/Phoenix",
    createdBy: "user_coach_001",
    updatedBy: "user_coach_001",
    createdAt: "2026-01-10T10:00:00-07:00",
    updatedAt: "2026-01-10T10:00:00-07:00",
    visibility: { scope: "team", teamId: "team_001" },
  },

  {
    id: "evt_practice_002",
    kind: "practice",
    title: "Practice (Optional Open Gym)",
    description: "Optional reps + conditioning. Sign in when you arrive.",
    location: {
      name: "Tooker Gym",
      address: "1234 S Example Rd, Tempe, AZ 85281",
    },
    startAt: "2026-01-15T18:00:00-07:00",
    endAt: "2026-01-15T19:30:00-07:00",
    allDay: false,
    tags: ["optional", "conditioning"],
    extra: {
      intensity: "medium",
      notes: "If you’re injured, check in with coach first.",
    },
    attachments: [],
    alerts: [{ id: "al_1", minutesBefore: 120, enabled: true }],
    timezone: "America/Phoenix",
    createdBy: "user_coach_001",
    updatedBy: "user_coach_001",
    createdAt: "2026-01-10T10:05:00-07:00",
    updatedAt: "2026-01-10T10:05:00-07:00",
    visibility: { scope: "team", teamId: "team_001" },
  },

  {
    id: "evt_game_001",
    kind: "games",
    title: "Match vs Desert Ridge",
    description: "Arrive early for warmups. Wear black jersey.",
    location: {
      name: "Desert Ridge HS",
      address: "9999 E Sample Ave, Mesa, AZ 85212",
      lat: 33.409,
      lng: -111.7,
    },
    startAt: "2026-01-16T18:30:00-07:00",
    endAt: "2026-01-16T20:00:00-07:00",
    allDay: false,
    tags: ["away", "match"],
    extra: {
      callTimeMinutesBefore: 60,
      uniform: "black",
      gateFee: "$5",
      notes: "Parents: parking is on the north lot.",
    },
    attachments: [],
    alerts: [
      { id: "al_1", minutesBefore: 1440, enabled: true },
      { id: "al_2", minutesBefore: 60, enabled: true },
      { id: "al_3", minutesBefore: 15, enabled: true },
    ],
    timezone: "America/Phoenix",
    createdBy: "user_coach_001",
    updatedBy: "user_coach_001",
    createdAt: "2026-01-10T10:12:00-07:00",
    updatedAt: "2026-01-12T09:20:00-07:00",
    visibility: { scope: "team", teamId: "team_001" },
  },

  {
    id: "evt_tournament_001",
    kind: "tournament",
    title: "Phoenix Classic Tournament",
    description:
      "All-day tournament. Schedule posted as an image attachment. Bring snacks + water.",
    location: {
      name: "Phoenix Convention Center",
      address: "100 N 3rd St, Phoenix, AZ 85004",
    },
    startAt: "2026-01-17T08:00:00-07:00",
    endAt: "2026-01-17T18:00:00-07:00",
    allDay: false,
    tags: ["tournament", "all-day"],
    extra: {
      checkIn: "07:15 AM",
      coachContact: "Coach Taylor: (555) 222-1111",
      parking: "Use Garage A",
      uniform: "white AM / black PM",
      court: "Court 12",
    },
    attachments: [
      {
        id: "att_sched_001",
        type: "image",
        url: "https://example.com/mock/phoenix-classic-schedule.png",
        fileName: "phoenix-classic-schedule.png",
        uploadedBy: "user_coach_001",
        createdAt: "2026-01-12T09:30:00-07:00",
      },
    ],
    alerts: [
      { id: "al_1", minutesBefore: 2880, enabled: true }, // 48h
      { id: "al_2", minutesBefore: 720, enabled: true }, // 12h
      { id: "al_3", minutesBefore: 90, enabled: true }, // 1.5h
    ],
    timezone: "America/Phoenix",
    createdBy: "user_coach_001",
    updatedBy: "user_coach_001",
    createdAt: "2026-01-12T09:25:00-07:00",
    updatedAt: "2026-01-12T09:30:00-07:00",
    visibility: { scope: "team", teamId: "team_001" },
  },

  {
    id: "evt_meeting_001",
    kind: "meeting",
    title: "Parent + Player Meeting",
    description:
      "Quick meeting to review tournament expectations + travel policy.",
    location: {
      name: "Tooker Gym (Classroom 2)",
      address: "6321 S Ellsworth Rd #146, Mesa, AZ 85212",
    },
    startAt: "2026-01-14T19:45:00-07:00",
    endAt: "2026-01-14T20:15:00-07:00",
    allDay: false,
    tags: ["meeting", "parents"],
    extra: {
      agenda: ["tournament schedule", "behavior expectations", "fundraiser"],
    },
    attachments: [
      {
        id: "att_doc_001",
        type: "pdf",
        url: "https://example.com/mock/travel-policy.pdf",
        fileName: "travel-policy.pdf",
        uploadedBy: "user_coach_001",
        createdAt: "2026-01-10T11:00:00-07:00",
      },
    ],
    alerts: [{ id: "al_1", minutesBefore: 180, enabled: true }],
    timezone: "America/Phoenix",
    createdBy: "user_coach_001",
    updatedBy: "user_coach_001",
    createdAt: "2026-01-10T10:20:00-07:00",
    updatedAt: "2026-01-10T11:05:00-07:00",
    visibility: { scope: "team", teamId: "team_001" },
  },

  {
    id: "evt_other_001",
    kind: "other",
    title: "Team Fundraiser Night",
    description:
      "Show this flyer at checkout. Portion of proceeds supports travel costs.",
    location: {
      name: "Chipotle - Tempe Marketplace",
      address: "2000 E Rio Salado Pkwy, Tempe, AZ 85281",
    },
    startAt: "2026-01-20T16:00:00-07:00",
    endAt: "2026-01-20T20:00:00-07:00",
    allDay: false,
    tags: ["fundraiser", "team"],
    extra: {
      code: "VOLLEY2026",
      notes: "Invite friends + family!",
    },
    attachments: [
      {
        id: "att_flyer_001",
        type: "image",
        url: "https://example.com/mock/fundraiser-flyer.png",
        fileName: "fundraiser-flyer.png",
        uploadedBy: "user_coach_001",
        createdAt: "2026-01-12T10:10:00-07:00",
      },
    ],
    alerts: [{ id: "al_1", minutesBefore: 1440, enabled: true }],
    timezone: "America/Phoenix",
    createdBy: "user_coach_001",
    updatedBy: "user_coach_001",
    createdAt: "2026-01-12T10:12:00-07:00",
    updatedAt: "2026-01-12T10:12:00-07:00",
    visibility: { scope: "team", teamId: "team_001" },
  },
];
