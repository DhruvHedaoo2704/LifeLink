import React from 'react';
import { motion } from 'framer-motion';

interface BloodDropAnimationProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const BloodDropAnimation: React.FC<BloodDropAnimationProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-8',
    md: 'w-8 h-10',
    lg: 'w-12 h-16',
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className}`}
      animate={{
        y: [0, -10, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg
        viewBox="0 0 24 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <motion.path
          d="M12 2C12 2 4 10 4 18C4 22.4183 7.58172 26 12 26C16.4183 26 20 22.4183 20 18C20 10 12 2 12 2Z"
          fill="currentColor"
          initial={{ fill: "#E53935" }}
          animate={{ fill: ["#E53935", "#F44336", "#E53935"] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
    </motion.div>
  );
};

export default BloodDropAnimation;