"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gradient" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = "gradient",
  size = "md",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const variantClasses = {
    gradient: "gradient-btn text-white font-semibold rounded-xl",
    outline:
      "bg-transparent border border-border-default text-text-primary rounded-xl hover:border-accent-purple hover:bg-surface-hover transition-all duration-300",
    ghost:
      "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-xl transition-all duration-300",
  };

  return (
    <button
      className={`
        ${sizeClasses[size]} 
        ${variantClasses[variant]} 
        relative inline-flex items-center justify-center gap-2 
        font-medium cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
