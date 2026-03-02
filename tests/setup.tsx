import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string | { pathname?: string };
    children: React.ReactNode;
    [key: string]: unknown;
  }) => {
    const resolvedHref = typeof href === 'string' ? href : (href.pathname ?? '');
    return (
      <a href={resolvedHref} {...props}>
        {children}
      </a>
    );
  }
}));
