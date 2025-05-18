import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { TimelineEvent } from './types';

interface TimelineItemProps {
  event: TimelineEvent;
  position: number;
  centerY: number;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ event, position, centerY }) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  
  // Format date for display
  const formattedDate = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(event.date);
  
  // Determine if event should appear above or below the timeline
  const isAbove = event.id.charCodeAt(0) % 2 === 0;
  
  // Calculate vertical position
  const yOffset = isAbove ? -100 : 100;
  
  // GSAP hover animation
  useEffect(() => {
    if (itemRef.current && dotRef.current) {
      const item = itemRef.current;
      const dot = dotRef.current;
      
      const timeline = gsap.timeline({ paused: true });
      
      timeline
        .to(dot, { 
          scale: 1.5, 
          backgroundColor: '#3B82F6', 
          boxShadow: '0 0 12px rgba(59, 130, 246, 0.6)', 
          duration: 0.3 
        })
        .to(item.querySelector('.event-card'), { 
          y: isAbove ? -5 : 5, 
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)', 
          duration: 0.4,
          scale: 1.03,
          ease: 'power2.out' 
        }, 0);
      
      const handleMouseEnter = () => timeline.play();
      const handleMouseLeave = () => timeline.reverse();
      
      item.addEventListener('mouseenter', handleMouseEnter);
      item.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        item.removeEventListener('mouseenter', handleMouseEnter);
        item.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [isAbove]);
  
  return (
    <div 
      ref={itemRef}
      className="timeline-item absolute"
      style={{ 
        left: position,
        top: centerY,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Event dot on timeline */}
      <div 
        ref={dotRef}
        className="absolute z-10 w-5 h-5 rounded-full bg-white border-4 border-slate-400 transform -translate-x-1/2 -translate-y-1/2"
      />
      
      {/* Event card */}
      <motion.div 
        className="event-card absolute w-48 p-4 bg-white rounded-lg shadow-md"
        style={{ 
          top: yOffset,
          transform: 'translateX(-50%)',
          transformOrigin: `center ${isAbove ? 'bottom' : 'top'}`
        }}
        initial={{ opacity: 0, y: isAbove ? -20 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.03 }}
      >
        <div className="font-semibold text-lg text-gray-800">{event.title}</div>
        <div className="text-sm text-blue-600 mb-2">{formattedDate}</div>
        <p className="text-sm text-gray-600">{event.description}</p>
        
        {/* Category tag if available */}
        {event.category && (
          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            {event.category}
          </span>
        )}
        
        {/* Connect line from dot to card */}
        <div 
          className="absolute w-px bg-slate-300" 
          style={{ 
            height: Math.abs(yOffset) - 24,
            top: isAbove ? '100%' : 'auto',
            bottom: isAbove ? 'auto' : '100%',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        />
      </motion.div>
    </div>
  );
};

export default TimelineItem; 