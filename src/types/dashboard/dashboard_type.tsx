import type { ReactNode } from 'react';

export interface AnimatedHoverDivProps {
  children: ReactNode;
  className?: string;
  scale?: number;
  duration?: number;
  bgColorHover?: string;
  elevationHover?: string;
  onClick?: () => void;
}

export interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}