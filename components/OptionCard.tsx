import React from 'react';

interface OptionCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  price?: string;
  selected: boolean;
  onClick: () => void;
}

export function OptionCard({
  icon,
  title,
  description,
  price,
  selected,
  onClick,
}: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full p-4 sm:p-6 rounded-xl border-2 transition-all text-left ${
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-surface hover:border-primary/40'
      }`}
    >
      {selected && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0 pr-8">
          <h3 className="text-base sm:text-lg font-bold text-text mb-1 break-words">{title}</h3>
          {description && <p className="text-xs sm:text-sm text-text-muted break-words">{description}</p>}
          {price && <p className="text-base sm:text-lg font-bold text-primary mt-1 sm:mt-2">{price}</p>}
        </div>
      </div>
    </button>
  );
}
