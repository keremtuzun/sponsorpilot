export interface IntakeForm {
  orgName: string;
  eventName: string;
  eventType: string;
  city: string;
  country: string;
  date: string;
  attendance: string;
  audience: string;
  reach: string;
  goalAmount: string;
  currency: string;
  floorDeal: string;
  offerables: string;
  pastSponsors: string;
  contactName: string;
}

export type Stage = "researched" | "contacted" | "negotiating" | "closed" | "declined";

export interface Prospect {
  company: string;
  category: string;
  whyFit: string;
  pitchAngle: string;
  estDealSize: string;
  outreachSubject: string;
  outreachBody: string;
  stage: Stage;
  closedAmount?: string;
  sentTo?: string;
}

export interface Campaign {
  strategy: {
    projectedRaise: string;
    positioning: string;
    approach: string[];
  };
  tiers: { name: string; price: string; benefits: string[] }[];
  deck: {
    tagline: string;
    aboutEvent: string;
    audienceStats: string[];
    whySponsor: string[];
    cta: string;
  };
  prospects: Prospect[];
  demoMode?: boolean;
}

export interface NegotiationResult {
  analysis: string;
  decision: "counter" | "accept" | "decline" | "escalate";
  proposedTerms: {
    amount: string;
    deliverables: string[];
  };
  replyEmail: {
    subject: string;
    body: string;
  };
  agreement?: string;
  demoMode?: boolean;
}
