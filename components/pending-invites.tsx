'use client';

import { useState, useEffect } from 'react';
import { Mail, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamInvite } from '@/lib/types';
import { api } from '@/lib/api';

interface PendingInvitesProps {
  onInviteAccepted?: () => void;
}

export function PendingInvites({ onInviteAccepted }: PendingInvitesProps) {
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptingInviteId, setAcceptingInviteId] = useState<string | null>(null);

  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    setIsLoading(true);
    try {
      const data = await api.teams.getPendingInvites();
      setInvites(data.invites || []);
    } catch (error) {
      console.error('Failed to load pending invites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    setAcceptingInviteId(inviteId);
    try {
      await api.teams.acceptInvite(inviteId);
      setInvites(invites.filter(inv => inv.id !== inviteId));
      if (onInviteAccepted) {
        onInviteAccepted();
      }
    } catch (error) {
      console.error('Failed to accept invite:', error);
      alert('Failed to accept invitation');
    } finally {
      setAcceptingInviteId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Pending Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Loading invitations...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invites.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Pending Invitations
        </CardTitle>
        <CardDescription>
          You have {invites.length} pending team {invites.length === 1 ? 'invitation' : 'invitations'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invites.map(invite => (
            <div
              key={invite.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card"
            >
              <div className="flex-1">
                <div className="font-medium">Team Invitation</div>
                <div className="text-sm text-muted-foreground">
                  Role: <span className="capitalize">{invite.role}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAcceptInvite(invite.id)}
                  disabled={acceptingInviteId === invite.id}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
