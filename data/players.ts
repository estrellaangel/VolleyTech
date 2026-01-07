export type Player = {
  id: string;
  name: string;
  number: number;
  position: "Setter" | "Outside" | "Middle" | "Opposite" | "Libero" | "DS";
  avatarUrl?: string;
  emails?: string[];
};

export const PLAYERS: Player[] = [
  {
    id: "p1",
    name: "Alexa Smith",
    number: 28,
    position: "DS",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    emails: ["fakeemail1@gmail.com"],
  },
  {
    id: "p2",
    name: "Estrella Lucky",
    number: 19,
    position: "Libero",
    avatarUrl: "https://i.pravatar.cc/150?img=32",
    emails: ["elucky13@gmail.com", "eangel0572@gmail.com"],
  },
  {
    id: "p3",
    name: "Lea Estephanie",
    number: 10,
    position: "Setter",
    avatarUrl: "https://i.pravatar.cc/150?img=32",
    emails: ["leap90@gmail.com"],
  },
  {
    id: "p4",
    name: "Esthela Angel",
    number: 7,
    position: "Middle",
    avatarUrl: "https://i.pravatar.cc/150?img=32",
    emails: ["eangel0572@gmail.com", "lovezebrea333@gmail.com"],
  },
  {
    id: "p5",
    name: "Molley Ramirez",
    number: 15,
    position: "DS",
    avatarUrl: "https://i.pravatar.cc/150?img=32",
    emails: ["mollyram15@gmail.com"],
  },
  {
    id: "p6",
    name: "Brianna Wetherignton",
    number: 9,
    position: "Libero",
    avatarUrl: "https://i.pravatar.cc/150?img=32",
    emails: ["wether9@gmail.com", "bery90@gmail.com"],
  },
  {
    id: "p7",
    name: "Skylar Theat",
    number: 22,
    position: "Libero",
    avatarUrl: "https://i.pravatar.cc/150?img=32",
    emails: ["skysup196@gmail.com"],
  },
];
