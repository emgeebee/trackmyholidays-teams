export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: 'admin' | 'member';
  teamIds: string[];
}

export interface Team {
  id: string;
  name: string;
  parentId?: string;
  memberIds: string[];
}

export interface Holiday {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  type: 'holiday' | 'bank-holiday';
  title: string;
}

export interface TeamHolidaysResponse {
  members: TeamMember[];
  teams: Team[];
  holidays: Holiday[];
}

export interface InviteRequest {
  email: string;
  teamIds: string[];
  role: 'admin' | 'member';
}

export interface TeamInvite {
  id: string;
  email: string;
  teamIds: string[];
  role: 'admin' | 'member';
  invitedBy: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
  expiresAt: string;
}
