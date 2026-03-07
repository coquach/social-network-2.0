import Image from 'next/image';
import Link from 'next/link';

export const Logo = () => {
  return (
    <Link href={'/'}>
      <div className='hover:opacity-75 transition items-center gap-x-2 flex'>
        <Image src={'/logo.svg'} alt='logo' height={35} width={35} />
        <p className='text-lg font-bold hidden 2xl:flex  text-sky-400'>Sentimeta</p>
      </div>
    </Link>
  );
};
