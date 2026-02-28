// src/ui/components/EmptyState.tsx
import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  themeColor?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon = '📭', 
  actionLabel, 
  onAction, 
  themeColor = '#3b82f6' 
}) => {
  return (
    <div className="empty-state-container">
      <div 
        className="empty-state-icon" 
        style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
      >
        {icon}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="empty-state-button"
          style={{ backgroundColor: themeColor, boxShadow: `0 4px 14px 0 ${themeColor}40` }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};