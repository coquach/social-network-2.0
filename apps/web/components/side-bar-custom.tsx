

import { LucideIcon } from 'lucide-react';
import { SidebarItem } from './sidebar-item';

type ItemSidebar = {
  label: string;
  href: string;
  icon: LucideIcon;
};

interface SidebarProps {
  items: ItemSidebar[];
}

export const SidebarCustom = ({items}: SidebarProps) => {

  return (
    <div className="h-full w-full p-2">
      <div className="flex flex-col items-end">
        <div className="space-y-2 w-full">
          {items.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
