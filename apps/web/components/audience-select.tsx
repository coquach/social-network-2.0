'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Audience } from '@/models/social/enums/social.enum';
import { Globe, Lock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudienceSelectProps {
  value?: Audience;
  onChange: (value: Audience) => void;
  className?: string;
}

export const AudienceSelect = ({
  value,
  onChange,
  className,
}: AudienceSelectProps) => {
  return (
    <Select onValueChange={(val) => onChange(val as Audience)} value={value}>
      <SelectTrigger
        className={cn(
          'w-32 h-4 text-xs bg-gray-50 border border-gray-200 rounded-lg',
          className
        )}
      >
        <SelectValue>
          {value === Audience.PUBLIC && (
            <div className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-gray-600" />
              <span>Công khai</span>
            </div>
          )}
          {value === Audience.FRIENDS && (
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-gray-600" />
              <span>Bạn bè</span>
            </div>
          )}
          {value === Audience.ONLY_ME && (
            <div className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-gray-600" />
              <span>Riêng tư</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        <SelectItem value={Audience.PUBLIC}>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" /> Công khai
          </div>
        </SelectItem>
        <SelectItem value={Audience.FRIENDS}>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" /> Bạn bè
          </div>
        </SelectItem>
        <SelectItem value={Audience.ONLY_ME}>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" /> Riêng tư
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
