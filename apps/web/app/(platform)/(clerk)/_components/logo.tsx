import { appConfig, brandColors } from '@repo/shared';
import Image from 'next/image';

export const Logo = () => {
  return (
    <div className=' items-center gap-x-2 flex'>
      <Image
        src='/logo.svg'
        alt={appConfig.name}
        height={60}
        width={60}
        className='w-10 h-10 sm:w-16 sm:h-16 '
      />
      <p className='md:text-5xl font-bold  text-3xl' style={{ color: brandColors.primary }}>
        {appConfig.name}
      </p>
    </div>
  );
};
