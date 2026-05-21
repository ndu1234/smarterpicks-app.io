export type Sport = 'NBA' | 'NFL' | 'MLB' | 'NHL';
export type PickResult = 'win' | 'loss' | 'push' | 'pending';
export type BetType = 'spread' | 'moneyline' | 'total' | 'prop';

export interface Pick {
  id: string;
  date: string;
  sport: Sport;
  homeTeam: string;
  awayTeam: string;
  betType: BetType;
  betDescription: string;
  odds: string;
  units: number;
  confidence: number;
  reasoning: string;
  result: PickResult;
  resultDescription?: string;
  postedAt: string;
}

export interface DailyCard {
  date: string;
  picks: Pick[];
  publishedAt: string;
}

export interface Stats {
  wins: number;
  losses: number;
  pushes: number;
  totalPicks: number;
  roi: number;
  unitsProfit: number;
  dollarProfit: number;
  sportBreakdown: SportStat[];
  monthlyData: MonthlyData[];
}

export interface SportStat {
  sport: Sport;
  wins: number;
  losses: number;
  pushes: number;
  roi: number;
  unitsProfit: number;
}

export interface MonthlyData {
  month: string;
  unitsProfit: number;
}

export interface Member {
  id: string;
  email: string;
  username: string;
  planType: 'monthly' | 'annual' | 'trial';
  trialEndsAt?: string;
  memberSince: string;
}
