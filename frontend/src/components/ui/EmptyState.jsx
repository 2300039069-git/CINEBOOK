import React from 'react';
import { Film, Ticket, Calendar, Search } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = Film,
  title = 'No results found',
  description = 'We could not find anything matching your search criteria.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-border/70 bg-surface-card/40 backdrop-blur-sm ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-surface-elevated/80 border border-border flex items-center justify-center mb-4 text-text-muted shadow-inner">
        <Icon className="w-8 h-8 text-text-secondary" />
      </div>
      <h4 className="text-base sm:text-lg font-bold text-text-primary mb-1.5">{title}</h4>
      <p className="text-xs sm:text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="secondary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
