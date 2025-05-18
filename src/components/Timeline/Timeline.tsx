import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Group } from '@visx/group';
import { Line } from '@visx/shape';
import { scaleTime } from '@visx/scale';
import gsap from 'gsap';
import { TimelineEvent, TimelineProps } from './types';
import TimelineItem from './TimelineItem';

const Timeline: React.FC<TimelineProps> = ({
  events,
  width = 1000,
  height = 200,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Calculate timeline dimensions
  const timelineWidth = Math.max(width, sortedEvents.length * 200); // Ensure minimum spacing
  const minDate = sortedEvents[0]?.date || new Date();
  const maxDate = sortedEvents[sortedEvents.length - 1]?.date || new Date();
  
  // Create scale for positioning events
  const timeScale = scaleTime({
    domain: [minDate, maxDate],
    range: [100, timelineWidth - 100], // Add padding on both sides
  });
  
  // Calculate constraints for dragging
  const constraintsLeft = containerWidth - timelineWidth;
  const constraintsRight = 0;
  
  // Transform x motion value for parallax effect
  const backgroundX = useTransform(x, [constraintsLeft, constraintsRight], [30, -30]);
  
  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
      
      // Initialize with GSAP animation
      gsap.fromTo(
        containerRef.current.querySelectorAll('.timeline-item'),
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.1,
          ease: 'power3.out'
        }
      );
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden ${className}`}
      style={{ width: '100%', height }}
    >
      <motion.div
        className="absolute top-0 left-0 h-full"
        style={{ 
          width: timelineWidth,
          x,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        drag="x"
        dragConstraints={{ 
          left: constraintsLeft < 0 ? constraintsLeft : 0, 
          right: 0 
        }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        dragElastic={0.1}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
      >
        {/* Timeline base line */}
        <svg width={timelineWidth} height={height}>
          <Group>
            <Line
              from={{ x: 0, y: height / 2 }}
              to={{ x: timelineWidth, y: height / 2 }}
              stroke="#CBD5E1"
              strokeWidth={4}
              className="timeline-line"
            />
          </Group>
        </svg>
        
        {/* Timeline events */}
        {sortedEvents.map((event) => (
          <TimelineItem
            key={event.id}
            event={event}
            position={timeScale(event.date)}
            centerY={height / 2}
          />
        ))}
      </motion.div>
      
      {/* Decorative background elements with parallax effect */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-[-1]"
        style={{ x: backgroundX }}
      >
        <div className="absolute top-1/4 left-1/4 w-24 h-24 rounded-full bg-blue-100 opacity-20" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-purple-100 opacity-20" />
      </motion.div>
    </div>
  );
};

export default Timeline; 