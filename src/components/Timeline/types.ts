export interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  category?: string;
  icon?: string;
}

export interface TimelineProps {
  events: TimelineEvent[];
  width?: number;
  height?: number;
  className?: string;
} 