import React from 'react';

interface AvatarProps {
  size?: number;
  name?: string;
  className?: string;
}

/**
 * Avatar placeholder component - hiển thị avatar mặc định cho tất cả user
 */
const Avatar: React.FC<AvatarProps> = ({ 
  size = 40, 
  name,
  className = '' 
}) => {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-primary/10 text-primary ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`
      }}
    >
      <span 
        className="material-symbols-outlined text-primary"
        style={{ fontSize: `${size * 0.6}px` }}
      >
        person
      </span>
    </div>
  );
};

export default Avatar;
