'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Users as UsersIcon, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { TeamManagement } from '@/components/team-management';
import { HolidayGantt } from '@/components/holiday-gantt';
import { PendingInvites } from '@/components/pending-invites';
import { api } from '@/lib/api';
import { Team, TeamMember, Holiday } from '@/lib/types';

export default function HomeContent() {
  const { user, login, logout, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'schedule' | 'management'>('schedule');
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

  useEffect(() => {
    const memberParam = searchParams.get('member');
    const teamParam = searchParams.get('team');
    
    if (memberParam) {
      setSelectedMemberIds([memberParam]);
    }
    if (teamParam) {
      setSelectedTeamIds([teamParam]);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const data = await api.teams.getHolidays(
        selectedTeamIds.length > 0 ? selectedTeamIds : undefined,
        selectedMemberIds.length > 0 ? selectedMemberIds : undefined
      );
      setTeams(data.teams);
      setMembers(data.members);
      setHolidays(data.holidays);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleFilterChange = (memberIds: string[], teamIds: string[]) => {
    setSelectedMemberIds(memberIds);
    setSelectedTeamIds(teamIds);

    const params = new URLSearchParams();
    if (memberIds.length > 0) {
      params.set('member', memberIds[0]);
    }
    if (teamIds.length > 0) {
      params.set('team', teamIds[0]);
    }

    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : '/');
    
    loadData();
  };

  const handleInvite = async (email: string, teamIds: string[], role: 'admin' | 'member') => {
    try {
      await api.teams.invite(email, teamIds, role);
      await loadData();
    } catch (error) {
      console.error('Failed to invite member:', error);
      alert('Failed to send invitation');
    }
  };

  const handleRemoveMember = async (teamId: string, memberId: string) => {
    try {
      await api.teams.removeMember(teamId, memberId);
      await loadData();
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Failed to remove member');
    }
  };

  const handleCreateTeam = async (name: string, parentId?: string) => {
    try {
      await api.teams.create(name, parentId);
      await loadData();
    } catch (error) {
      console.error('Failed to create team:', error);
      alert('Failed to create team');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) {
      return;
    }
    try {
      await api.teams.delete(teamId);
      await loadData();
    } catch (error) {
      console.error('Failed to delete team:', error);
      alert('Failed to delete team');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-6 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md">
          <div className="space-y-2">
            <Calendar className="h-16 w-16 mx-auto text-blue-600" />
            <h1 className="text-3xl font-bold">Team Holiday Tracker</h1>
            <p className="text-muted-foreground">
              View and manage your team's holidays in one place
            </p>
          </div>
          <Button onClick={login} size="lg" className="w-full">
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold">Team Holiday Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-8 w-8 rounded-full"
                />
              )}
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="border-b bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'schedule'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Calendar className="h-4 w-4 inline mr-2" />
              Holiday Schedule
            </button>
            <button
              onClick={() => setActiveTab('management')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'management'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <UsersIcon className="h-4 w-4 inline mr-2" />
              Team Management
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 py-8">
          <PendingInvites onInviteAccepted={loadData} />
          
          {isLoadingData ? (
            <div className="text-center py-12">
              <div className="text-lg">Loading data...</div>
            </div>
          ) : activeTab === 'schedule' ? (
            <HolidayGantt
              holidays={holidays}
              members={members}
              teams={teams}
              selectedMemberIds={selectedMemberIds}
              selectedTeamIds={selectedTeamIds}
              onFilterChange={handleFilterChange}
            />
          ) : (
            <TeamManagement
              teams={teams}
              members={members}
              onInvite={handleInvite}
              onRemoveMember={handleRemoveMember}
              onCreateTeam={handleCreateTeam}
              onDeleteTeam={handleDeleteTeam}
            />
          )}
        </div>
      </main>
    </div>
  );
}
