import React, { useState, useEffect, useRef } from 'react';
import type { ReleaseGroup } from '../../utils/types';
import QuestionMark from "/images/question-mark.png";

export default function ImageStackScroller({ releases }: { releases: ReleaseGroup[] }) {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [containerHeight, setContainerHeight] = useState(250);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>(null);
  
  // Use container height as image height for calculations
  const imageHeight = containerHeight;
  const snapDelay = 150;
  
  useEffect(() => {
    // Get container height from parent
    const updateHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight;
        setContainerHeight(height);
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setScrollY(containerRef.current.scrollTop);
        setIsScrolling(true);
        
        // Clear existing timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        
        // Set timeout for snap behavior
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
          snapToNearestImage();
        }, snapDelay);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        container.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, [snapDelay, imageHeight]);

  const snapToNearestImage = () => {
    if (!containerRef.current) return;
    
    // Get the current scroll position directly from the container
    const currentScrollTop = containerRef.current.scrollTop;
    const scrollProgress = currentScrollTop / imageHeight;
    const currentIndex = Math.floor(scrollProgress);
    const progress = scrollProgress - currentIndex;
    
    // Determine which image to snap to based on progress
    const targetIndex = progress > 0.5 ? currentIndex + 1 : currentIndex;
    const targetScroll = Math.max(0, Math.min(targetIndex * imageHeight, (releases.length - 1) * imageHeight));
    
    // Smooth scroll to target position
    containerRef.current.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  const getImageStyle = (index: number): React.CSSProperties => {
    const scrollProgress = scrollY / imageHeight;
    const currentIndex = Math.floor(scrollProgress);
    const progress = scrollProgress - currentIndex;
    
    let height = imageHeight;
    let opacity = 1;
    let zIndex = releases.length - index;
    
    if (index === currentIndex) {
      // Current (front) image - shrinks from full height to 0, bottom-aligned
      height = imageHeight * (1 - progress);
      opacity = 1;
      zIndex = 10;
    } else if (index === currentIndex + 1) {
      // Next (back) image - fades in behind, full height, bottom-aligned
      height = imageHeight;
      opacity = progress;
      zIndex = 9;
    } else if (index < currentIndex) {
      // Previous images - completely hidden
      height = 0;
      opacity = 0;
      zIndex = 1;
    } else {
      // Future images - hidden but ready
      height = imageHeight;
      opacity = 0;
      zIndex = 1;
    }
    
    return {
      position: 'absolute' as const,
      bottom: 0,
      left: 0,
      right: 0,
      height: `${height}px`,
      opacity,
      zIndex,
      transition: 'none',
      overflow: 'hidden'
    };
  };

  return (
    <div 
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          overflow: 'auto',
          flex: 1,
          scrollBehavior: isScrolling ? 'auto' : 'smooth'
        }}
      >
        {/* Invisible spacer to create scroll area */}
        <div style={{ height: (releases.length - 1) * imageHeight }} />
        
        {/* Fixed container for stacked images */}
        <div 
          style={{ 
            height: imageHeight,
            position: 'sticky',
            bottom: 0
          }}
        >
          {/* Stacked images */}
          {releases.map((release, index) => (
            <div
              key={index}
              style={getImageStyle(index)}
            >
              <img
                src={release.coverUrl || QuestionMark}
                alt={`Image ${index + 1} of ${releases.length}`}
                style={{ 
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  userSelect: 'none' as const,
                  pointerEvents: 'none' as const,
                  imageRendering: release.coverUrl ? undefined : "pixelated"
                }}
                draggable={false}
                loading={index < 2 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};