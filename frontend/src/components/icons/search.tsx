'use client';

import { HTMLAttributes } from 'react';

import { motion, useAnimation } from 'motion/react';

const SearchIcon = (props: HTMLAttributes<HTMLDivElement>) => {
  const { className } = props;

  const controls = useAnimation();

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={{
        normal: { x: 0, y: 0 },
        animate: {
          x: [0, 0, -3, 0],
          y: [0, -4, 0, 0],
        },
      }}
      transition={{
        duration: 1,
        bounce: 0.3,
      }}
      animate={controls}
      className={className}
      onMouseEnter={() => controls.start('animate')}
      onMouseLeave={() => controls.start('normal')}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </motion.svg>
  );
};

export { SearchIcon };
