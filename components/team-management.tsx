'use client';

import { useState } from 'react';
import { Users, UserPlus, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Team, TeamMember } from '@/lib/types';

interface TeamManagementProps {
  teams: Team[];
  members: TeamMember[];
  onInvite: (email: string, teamIds: string[], role: 'admin' | 'member') => Promise<void>;
  onRemoveMember: (teamId: string, memberId: string) => Promise<void>;
  onCreateTeam: (name: string, parentId?: string) => Promise<void>;
  onDeleteTeam: (teamId: string) => Promise<void>;
}

export function TeamManagement({
  teams,
  members,
  onInvite,
  onRemoveMember,
  onCreateTeam,
  onDeleteTeam,
}: TeamManagementProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [parentTeamId, setParentTeamId] = useState<string>('');

  const handleInvite = async () => {
    if (!inviteEmail || selectedTeams.length === 0) return;
    await onInvite(inviteEmail, selectedTeams, inviteRole);
    setInviteDialogOpen(false);
    setInviteEmail('');
    setSelectedTeams([]);
    setInviteRole('member');
  };

  const handleCreateTeam = async () => {
    if (!newTeamName) return;
    await onCreateTeam(newTeamName, parentTeamId || undefined);
    setTeamDialogOpen(false);
    setNewTeamName('');
    setParentTeamId('');
  };

  const getTeamMembers = (teamId: string) => {
    return members.filter(member => member.teamIds.includes(teamId));
  };

  const getSubTeams = (parentId?: string) => {
    return teams.filter(team => team.parentId === parentId);
  };

  const renderTeam = (team: Team, depth = 0) => {
    const teamMembers = getTeamMembers(team.id);
    const subTeams = getSubTeams(team.id);

    return (
      <div key={team.id} style={{ marginLeft: `${depth * 24}px` }}>
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>{team.name}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  ({teamMembers.length} members)
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteTeam(team.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {teamMembers.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded border"
                >
                  <div className="flex items-center gap-3">
                    {member.picture && (
                      <img
                        src={member.picture}
                        alt={member.name}
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {member.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-secondary px-2 py-1 rounded">
                      {member.role}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveMember(team.id, member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {subTeams.map(subTeam => renderTeam(subTeam, depth + 1))}
      </div>
    );
  };

  const rootTeams = getSubTeams();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Management</h2>
        <div className="flex gap-2">
          <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
            <DialogTrigger>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Add a new team or sub-team to your organization
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Team Name</label>
                  <Input
                    placeholder="Engineering, Marketing, etc."
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Parent Team (Optional)</label>
                  <Select
                    value={parentTeamId}
                    onChange={(e) => setParentTeamId(e.target.value)}
                  >
                    <option value="">None (Root Team)</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <Button onClick={handleCreateTeam} className="w-full">
                  Create Team
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your team
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Teams</label>
                  <div className="space-y-2 border rounded-md p-3 max-h-40 overflow-y-auto">
                    {teams.map(team => (
                      <label key={team.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedTeams.includes(team.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTeams([...selectedTeams, team.id]);
                            } else {
                              setSelectedTeams(selectedTeams.filter(id => id !== team.id));
                            }
                          }}
                        />
                        <span>{team.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button onClick={handleInvite} className="w-full">
                  Send Invitation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {rootTeams.map(team => renderTeam(team))}
      </div>
    </div>
  );
}
