'use client';

import { useRouter } from 'next/navigation';

interface FloatingExitButtonProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  customIcon?: React.ReactNode;
  onClick?: () => void;
}

export default function FloatingExitButton({ 
  position = 'top-right',
  className = '',
  color = 'red',
  size = 'md',
  customIcon,
  onClick
}: FloatingExitButtonProps) {
  const router = useRouter();

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-2';
      case 'md':
        return 'p-3';
      case 'lg':
        return 'p-4';
      default:
        return 'p-3';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'red':
        return 'bg-red-500 hover:bg-red-600';
      case 'blue':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'green':
        return 'bg-green-500 hover:bg-green-600';
      case 'purple':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'orange':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'gray':
        return 'bg-gray-500 hover:bg-gray-600';
      default:
        return 'bg-red-500 hover:bg-red-600';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-5 h-5';
      case 'md':
        return 'w-6 h-6';
      case 'lg':
        return 'w-8 h-8';
      default:
        return 'w-6 h-6';
    }
  };

  const handleExit = () => {
    if (onClick) {
      onClick();
    } else {
      router.push('/games');
    }
  };

  const defaultIcon = (
    <svg 
      className={getIconSize()} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M6 18L18 6M6 6l12 12" 
      />
    </svg>
  );

  return (
    <button
      onClick={handleExit}
      className={`
        fixed z-50 ${getSizeClasses()} ${getColorClasses()}
        text-white rounded-full shadow-lg transition-all duration-200
        hover:scale-110 active:scale-95
        ${getPositionClasses()}
        ${className}
      `}
      aria-label="Exit game"
    >
      {customIcon || defaultIcon}
    </button>
  );
} 