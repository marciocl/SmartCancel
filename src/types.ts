export type ProfileType = 'REVENUE_MANAGER' | 'CRM_AGENT';

export type GroupType = 'CONTROL' | 'TEST';

export interface Reservation {
  id: string;
  guestName: string;
  leadTime: number;
  specialRequests: number;
  channel: string;
  rateType: string;
  totalValue: number;
  riskScore: number;
  riskLevel: 'ALTO' | 'MÉDIO' | 'BAIXO';
  reasons: string[];
  overbookingRec: string;
  crmRec: string;
  crmTemplate: {
    subject: string;
    body: string;
  };
  riskHistory?: { day: string; score: number }[];
}

export interface ActionLog {
  id: string;
  timestamp: string;
  profile: ProfileType;
  group: GroupType;
  reservationId: string;
  guestName: string;
  actionTaken: string;
  details: string;
}
