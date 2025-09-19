'use client';

import React from 'react';
import Link from 'next/link';
import { MagneticButton } from './ui/magicbtn';
import { IconBrandGithub } from '@tabler/icons-react';

function Navbar() {
  return (
    <nav className="flex w-full items-center justify-between border-t px-4 py-4 dark:border-neutral-800">
      {/* Left side - Logo */}
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-full bg-gradient-to-br from-violet-500 to-black" />
        <Link href={"/"} className="text-base font-bold md:text-2xl">Daddy AI</Link>
      </div>

      {/* Right side - GitHub Star Button with Magnetic Effect */}
      <MagneticButton distance={0.2}>
        <Link
          href="https://github.com/ad1tyayadav/DaddyAI"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-gray-800 md:px-6 md:py-2 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
           Give a Star<IconBrandGithub/>
        </Link>
      </MagneticButton>
    </nav>
  );
}

export default Navbar;
