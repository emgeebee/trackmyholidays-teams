import { TeamHolidaysResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.trackmyholidays.com';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  teams: {
    getAll: () => fetchWithAuth(`${API_BASE_URL}/api/teams`),
    
    getMembers: (teamId: string) => 
      fetchWithAuth(`${API_BASE_URL}/api/teams/${teamId}/members`),
    
    getHolidays: (teamIds?: string[], memberIds?: string[]): Promise<TeamHolidaysResponse> => {
      const params = new URLSearchParams();
      if (teamIds?.length) {
        teamIds.forEach(id => params.append('teamId', id));
      }
      if (memberIds?.length) {
        memberIds.forEach(id => params.append('memberId', id));
      }
      return fetchWithAuth(`${API_BASE_URL}/api/teams/holidays?${params}`);
    },
    
    invite: (email: string, teamIds: string[], role: 'admin' | 'member') =>
      fetchWithAuth(`${API_BASE_URL}/api/teams/invite`, {
        method: 'POST',
        body: JSON.stringify({ email, teamIds, role }),
      }),
    
    removeMember: (teamId: string, memberId: string) =>
      fetchWithAuth(`${API_BASE_URL}/api/teams/${teamId}/members/${memberId}`, {
        method: 'DELETE',
      }),
    
    create: (name: string, parentId?: string) =>
      fetchWithAuth(`${API_BASE_URL}/api/teams`, {
        method: 'POST',
        body: JSON.stringify({ name, parentId }),
      }),
    
    update: (teamId: string, name: string) =>
      fetchWithAuth(`${API_BASE_URL}/api/teams/${teamId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      }),
    
    delete: (teamId: string) =>
      fetchWithAuth(`${API_BASE_URL}/api/teams/${teamId}`, {
        method: 'DELETE',
      }),
  },
};
