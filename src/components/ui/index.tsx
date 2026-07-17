"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-emerald-500 shadow-lg shadow-emerald-500/20",
      secondary: "bg-card hover:bg-card-hover text-text-primary border border-border focus:ring-emerald-500",
      ghost: "hover:bg-card text-text-secondary hover:text-text-primary focus:ring-emerald-500",
      danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 shadow-lg shadow-red-500/20",
      outline: "border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white focus:ring-emerald-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      icon: "p-2",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// Card Component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "glow";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-card border border-border",
      glass: "glass",
      glow: "bg-card border border-emerald-500/50 shadow-lg shadow-emerald-500/10",
    };

    return (
      <div
        ref={ref}
        className={cn("rounded-xl p-6", variants[variant], className)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200",
              icon && "pl-10",
              error && "border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

// Badge Component
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "gold";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  size = "sm",
  ...props
}) => {
  const variants = {
    default: "bg-card text-text-secondary border-border",
    success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    error: "bg-red-500/20 text-red-400 border-red-500/30",
    info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    gold: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};

// Avatar Component
interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = "md",
  className,
}) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full object-cover ring-2 ring-border",
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center font-semibold text-white ring-2 ring-border",
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
};

// Skeleton Component
interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return <div className={cn("skeleton rounded-lg", className)} />;
};

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={cn(
            "relative w-full bg-card border border-border rounded-xl shadow-2xl animate-fade-in",
            sizes[size]
          )}
        >
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
              <button
                onClick={onClose}
                className="p-1 text-text-muted hover:text-text-primary transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

// Tabs Component
interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex space-x-1 bg-surface p-1 rounded-lg border border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
            activeTab === tab.id
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              : "text-text-secondary hover:text-text-primary hover:bg-card"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                "ml-2 px-2 py-0.5 text-xs rounded-full",
                activeTab === tab.id
                  ? "bg-emerald-400/30 text-white"
                  : "bg-card text-text-muted"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

// Progress Bar Component
interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "emerald" | "gold" | "blue" | "red";
  size?: "sm" | "md";
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = "emerald",
  size = "md",
  showLabel = false,
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    emerald: "bg-emerald-500",
    gold: "bg-yellow-500",
    blue: "bg-blue-500",
    red: "bg-red-500",
  };

  const sizes = {
    sm: "h-1",
    md: "h-2",
  };

  return (
    <div className="w-full">
      <div className={cn("w-full bg-surface rounded-full overflow-hidden", sizes[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-text-muted text-right">
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  );
};

// Tooltip Component (Simple)
interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface" />
      </div>
    </div>
  );
};

// Empty State Component
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center text-text-muted mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: "emerald" | "gold" | "blue" | "purple";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = "emerald",
}) => {
  const colors = {
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
    gold: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30",
  };

  const iconColors = {
    emerald: "text-emerald-400 bg-emerald-500/20",
    gold: "text-yellow-400 bg-yellow-500/20",
    blue: "text-blue-400 bg-blue-500/20",
    purple: "text-purple-400 bg-purple-500/20",
  };

  return (
    <Card className={cn("bg-gradient-to-br border", colors[color])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary mb-1">{title}</p>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  "text-xs font-medium",
                  change >= 0 ? "text-emerald-400" : "text-red-400"
                )}
              >
                {change >= 0 ? "+" : ""}
                {change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-text-muted ml-2">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className={cn("p-3 rounded-xl", iconColors[color])}>{icon}</div>
        )}
      </div>
    </Card>
  );
};
