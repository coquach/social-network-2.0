'use client'
import { HomeIcon, SquarePlay, UsersRound } from "lucide-react";
import { TabItem } from "./tab-item";

export const Tabs = () => {
  const items = [
    {
      label: 'Home',
      href: '/',
      icon: HomeIcon,
    },
    {
      label: 'Groups',
      href: '/groups',
      icon: UsersRound,
    },
    {
      label: 'Videos',
      href: '/videos',
      icon: SquarePlay,
    },
  ];
  return (
    <div className='md:col-span-2 md:block hidden h-full px-8'>
      <div className='w-full h-full flex flex-row items-center gap-2'>
        <div className='h-full flex-1 flex items-center gap-2'>
          {items.map((item) => (
            <TabItem key={item.href} label={item.label} href={item.href} icon={item.icon}  />
          ))}
        </div>
      </div>
    </div>
  );
};
