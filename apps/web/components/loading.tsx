'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-9999 w-screen flex items-center justify-center bg-white">
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.6, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, duration: 1 }}
        className="flex flex-col items-center justify-center gap-4 p-8"
      >
        {/* Logo */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="items-center gap-x-2 flex"
        >
          <motion.div
            animate={{ rotate: [0, 6, -6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image
              src={'/logo.svg'}
              alt="logo"
              height={60}
              width={60}
              className="w-10 h-10 sm:w-16 sm:h-16 "
            />
          </motion.div>
          <motion.p
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="md:text-5xl font-bold text-3xl text-sky-400"
          >
            Sentimeta
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
