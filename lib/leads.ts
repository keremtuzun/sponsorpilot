// Seed lead list for the growth agent. In production this grows via a Firestore
// collection fed by a scraper + manual adds; the agent decides who to pitch each day.
export interface Lead {
  name: string;
  type: string;
  country: string;
  eventMonth: string;
  channel: string;
  status: "new" | "contacted" | "replied" | "customer";
}

export const LEADS: Lead[] = [
  { name: "Istanbul Indie Game Jam", type: "Game jam", country: "Turkey", eventMonth: "November 2026", channel: "Instagram DM", status: "new" },
  { name: "TEDxYouth Ankara", type: "Student conference", country: "Turkey", eventMonth: "October 2026", channel: "Email", status: "new" },
  { name: "Berlin Youth Climate Summit", type: "Youth summit", country: "Germany", eventMonth: "December 2026", channel: "Email", status: "new" },
  { name: "HackHighSchool NYC", type: "Hackathon", country: "USA", eventMonth: "October 2026", channel: "Discord", status: "new" },
  { name: "Delhi Youth Parliament", type: "Debate event", country: "India", eventMonth: "September 2026", channel: "Instagram DM", status: "new" },
  { name: "Lyon Junior Enterprise Forum", type: "Student business event", country: "France", eventMonth: "November 2026", channel: "LinkedIn", status: "new" },
  { name: "Robotics League Izmir", type: "Sports/tech tournament", country: "Turkey", eventMonth: "January 2027", channel: "Email", status: "contacted" },
  { name: "Cambridge Schools Debate Open", type: "Debate tournament", country: "UK", eventMonth: "October 2026", channel: "Email", status: "new" },
];
