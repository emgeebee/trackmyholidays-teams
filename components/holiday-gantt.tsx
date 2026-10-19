'use client';

import { useMemo, useState } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, isSameDay, isWeekend } from 'date-fns';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Holiday, TeamMember, Team } from '@/lib/types';

interface HolidayGanttProps {
  holidays: Holiday[];
  members: TeamMember[];
  teams: Team[];
  selectedMemberIds?: string[];
  selectedTeamIds?: string[];
  onFilterChange: (memberIds: string[], teamIds: string[]) => void;
}

export function HolidayGantt({
  holidays,
  members,
  teams,
  selectedMemberIds = [],
  selectedTeamIds = [],
  onFilterChange,
}: HolidayGanttProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filterMemberId, setFilterMemberId] = useState<string>('');
  const [filterTeamId, setFilterTeamId] = useState<string>('');

  const startDate = startOfMonth(currentMonth);
  const endDate = endOfMonth(addMonths(currentMonth, 2));
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const filteredMembers = useMemo(() => {
    let result = members;

    if (filterMemberId) {
      result = result.filter(m => m.id === filterMemberId);
    }

    if (filterTeamId) {
      result = result.filter(m => m.teamIds.includes(filterTeamId));
    }

    return result;
  }, [members, filterMemberId, filterTeamId]);

  const getMemberHolidays = (memberId: string) => {
    return holidays.filter(h => h.userId === memberId);
  };

  const isHolidayDay = (memberId: string, day: Date) => {
    const memberHolidays = getMemberHolidays(memberId);
    return memberHolidays.some(holiday => {
      const start = new Date(holiday.startDate);
      const end = new Date(holiday.endDate);
      return day >= start && day <= end;
    });
  };

  const getHolidayForDay = (memberId: string, day: Date) => {
    const memberHolidays = getMemberHolidays(memberId);
    return memberHolidays.find(holiday => {
      const start = new Date(holiday.startDate);
      const end = new Date(holiday.endDate);
      return day >= start && day <= end;
    });
  };

  const applyFilters = () => {
    const memberIds = filterMemberId ? [filterMemberId] : [];
    const teamIds = filterTeamId ? [filterTeamId] : [];
    onFilterChange(memberIds, teamIds);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Team Holiday Schedule</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[200px] text-center">
              {format(startDate, 'MMM yyyy')} - {format(endDate, 'MMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium">Filter by Person</label>
            <Select
              value={filterMemberId}
              onChange={(e) => setFilterMemberId(e.target.value)}
            >
              <option value="">All People</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">Filter by Team</label>
            <Select
              value={filterTeamId}
              onChange={(e) => setFilterTeamId(e.target.value)}
            >
              <option value="">All Teams</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </Select>
          </div>
          <Button onClick={applyFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      </Card>

      <div className="overflow-x-auto border rounded-lg">
        <div className="min-w-max">
          <div className="flex bg-muted">
            <div className="sticky left-0 z-10 w-48 p-2 bg-muted border-r font-medium">
              Name
            </div>
            {days.map((day, idx) => (
              <div
                key={idx}
                className={`w-8 p-1 text-center text-xs border-r ${
                  isWeekend(day) ? 'bg-muted/50' : ''
                }`}
              >
                <div className="font-medium">{format(day, 'd')}</div>
                <div className="text-[10px] text-muted-foreground">
                  {format(day, 'EEE').substring(0, 1)}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-background">
            {filteredMembers.map((member, memberIdx) => (
              <div
                key={member.id}
                className={`flex border-b ${
                  memberIdx % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                }`}
              >
                <div className="sticky left-0 z-10 w-48 p-2 border-r bg-inherit flex items-center gap-2">
                  {member.picture && (
                    <img
                      src={member.picture}
                      alt={member.name}
                      className="h-6 w-6 rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium truncate">
                    {member.name}
                  </span>
                </div>
                {days.map((day, dayIdx) => {
                  const holiday = getHolidayForDay(member.id, day);
                  const isHoliday = !!holiday;
                  const isBankHoliday = holiday?.type === 'bank-holiday';

                  return (
                    <div
                      key={dayIdx}
                      className={`w-8 p-1 border-r ${
                        isWeekend(day) ? 'bg-muted/30' : ''
                      }`}
                      title={holiday?.title}
                    >
                      {isHoliday && (
                        <div
                          className={`h-6 rounded ${
                            isBankHoliday
                              ? 'bg-purple-500'
                              : 'bg-blue-500'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4 items-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded" />
          <span>Holiday</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded" />
          <span>Bank Holiday</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-muted/50 border rounded" />
          <span>Weekend</span>
        </div>
      </div>
    </div>
  );
}
