import Image from 'next/image';

export const Logo = () => {
  return (
    <div className=' items-center gap-x-2 flex'>
      <Image
        src={'/logo.svg'}
        alt='logo'
        height={60}
        width={60}
        className='w-10 h-10 sm:w-16 sm:h-16 '
      />
      <p className='md:text-5xl font-bold  text-3xl  text-sky-400'>Sentimeta</p>
    </div>
  );
};
