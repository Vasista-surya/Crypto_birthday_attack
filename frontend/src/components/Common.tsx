import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
}

export function Card({ children, className = '', elevated = false }: CardProps) {
  return (
    <div className={`rounded-xl border transition-shadow ${elevated ? 'card-elevated shadow-xl' : 'card'} ${className}`}>
      {children}
    </div>
  );
}

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Section({ title, description, children, className = '' }: SectionProps) {
  return (
    <section className={`${className}`} aria-labelledby={title.toLowerCase().replace(/\s+/g, '-')}>
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-ink-100">{title}</h2>
        {description && <p className="mt-1 text-ink-400">{description}</p>}
      </header>
      <div>{children}</div>
    </section>
  );
}

interface CalloutProps {
  type: 'info' | 'warning' | 'danger' | 'success';
  title?: string;
  children: ReactNode;
}

export function Callout({ type, title, children }: CalloutProps) {
  const styles = {
    info: 'bg-blue-900/20 border-blue-800 text-blue-300',
    warning: 'bg-amber-900/20 border-amber-800 text-amber-300',
    danger: 'bg-red-900/20 border-red-800 text-red-300',
    success: 'bg-teal-900/20 border-teal-800 text-teal-300',
  };

  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    danger: '🚨',
    success: '✅',
  };

  return (
    <div className={`border rounded-lg p-4 ${styles[type]}`} role="alert">
      <div className="flex gap-3">
        <span aria-hidden="true">{icons[type]}</span>
        <div>
          {title && <h3 className="font-medium mb-1">{title}</h3>}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-ink-700 text-ink-200',
    success: 'bg-teal-900/30 text-teal-300 border border-teal-800',
    warning: 'bg-amber-900/30 text-amber-300 border border-amber-800',
    danger: 'bg-red-900/30 text-red-300 border border-red-800',
    info: 'bg-blue-900/30 text-blue-300 border border-blue-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  const styles = {
    success: 'toast-success',
    error: 'toast-error',
    info: 'toast-info',
  };

  return (
    <div className={styles[type]} role="alert" aria-live="polite">
      <div className="flex items-start gap-3">
        <div className="flex-1">{message}</div>
        <button onClick={onClose} className="text-current opacity-70 hover:opacity-100" aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`${sizes[size]} border-ink-700 border-t-teal-500 rounded-full animate-spin ${className}`} aria-hidden="true" />
  );
}

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className = '', lines = 3 }: SkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`} aria-hidden="true">
      <div className="h-6 bg-ink-800 rounded w-3/4 animate-pulse" />
      {[...Array(lines)].map((_, i) => (
        <div key={i} className="h-4 bg-ink-800 rounded w-full animate-pulse" />
      ))}
    </div>
  );
}

interface HashDisplayProps {
  fullDigest: string;
  truncatedHex: string;
  bits: number;
  label?: string;
}

export function HashDisplay({ fullDigest, truncatedHex, bits, label }: HashDisplayProps) {
  const hexChars = (bits + 3) / 4;
  const prefix = fullDigest.slice(0, hexChars);
  const rest = fullDigest.slice(hexChars);

  return (
    <div className="space-y-2">
      {label && <label className="text-xs text-ink-500 uppercase tracking-wide">{label}</label>}
      <div className="font-mono text-xs break-all">
        <span className="hash-highlight">{prefix}</span>
        <span className="text-ink-400">{rest}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-ink-500">
        <span className="px-2 py-0.5 bg-ink-800 rounded font-mono">{truncatedHex}</span>
        <span>({bits} bits)</span>
      </div>
    </div>
  );
}

interface CopyButtonProps {
  text: string;
  label?: string;
  onCopied?: () => void;
}

export function CopyButton({ text, label = 'Copy', onCopied }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    onCopied?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="btn-secondary text-xs gap-1"
      aria-label={label}
    >
      {copied ? '✓' : '📋'} {copied ? 'Copied!' : label}
    </button>
  );
}

// Need to import useState
import { useState } from 'react';