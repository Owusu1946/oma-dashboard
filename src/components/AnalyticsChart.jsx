import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartSkeleton } from './ShimmerLoading';

// Sample data for different time periods
const mockupChartData = {
  day: [
    { label: '12AM', value: 5 },
    { label: '4AM', value: 2 },
    { label: '8AM', value: 8 },
    { label: '12PM', value: 12 },
    { label: '4PM', value: 25 },
    { label: '8PM', value: 18 },
  ],
  week: [
    { label: 'Mon', value: 12 },
    { label: 'Tue', value: 19 },
    { label: 'Wed', value: 15 },
    { label: 'Thu', value: 22 },
    { label: 'Fri', value: 30 },
    { label: 'Sat', value: 18 },
    { label: 'Sun', value: 10 },
  ],
  month: [
    { label: 'Week 1', value: 45 },
    { label: 'Week 2', value: 65 },
    { label: 'Week 3', value: 53 },
    { label: 'Week 4', value: 78 },
  ],
  year: [
    { label: 'Jan', value: 120 },
    { label: 'Feb', value: 145 },
    { label: 'Mar', value: 178 },
    { label: 'Apr', value: 250 },
    { label: 'May', value: 210 },
    { label: 'Jun', value: 320 },
    { label: 'Jul', value: 315 },
    { label: 'Aug', value: 350 },
    { label: 'Sep', value: 290 },
    { label: 'Oct', value: 310 },
    { label: 'Nov', value: 285 },
    { label: 'Dec', value: 380 },
  ]
};

// Ultra-sleek line chart component
function SleekLineChart({ data, maxValue, activeIndex, setActiveIndex, animate = true, height = 300 }) {
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 220 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipData, setTooltipData] = useState({ x: 0, y: 0, value: 0, label: '' });
  
  // Update dimensions when window resizes
  useEffect(() => {
    if (svgRef.current) {
      const updateDimensions = () => {
        const width = svgRef.current.parentElement.clientWidth;
        setDimensions({ width, height: 220 });
      };
      
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, [svgRef]);
  
  // Early return if no dimensions yet
  if (dimensions.width === 0) return <div ref={svgRef} className="h-56" />;
  
  // Calculate chart coordinates
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = dimensions.width - padding.left - padding.right;
  const chartHeight = dimensions.height - padding.top - padding.bottom;
  
  // Points for the line
  const points = data.map((item, i) => {
    const x = padding.left + (i * (chartWidth / (data.length - 1)));
    // Invert Y axis (SVG 0,0 is top-left)
    const y = padding.top + chartHeight - (item.value / maxValue) * chartHeight;
    return { x, y, ...item };
  });
  
  // Generate the SVG path
  const linePath = points.reduce((path, point, i) => {
    const command = i === 0 ? 'M' : 'C';
    
    // For curved lines (bezier)
    const prevPoint = i > 0 ? points[i - 1] : point;
    const nextPoint = i < points.length - 1 ? points[i + 1] : point;
    
    // Control points for the curve (create a smooth curve)
    const cp1x = prevPoint.x + (point.x - prevPoint.x) * 0.5;
    const cp1y = prevPoint.y;
    const cp2x = point.x - (point.x - prevPoint.x) * 0.5;
    const cp2y = point.y;
    
    return i === 0 
      ? `${path}${command}${point.x},${point.y}` 
      : `${path}${command}${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`;
  }, '');
  
  // Area beneath the line (for gradient fill)
  const areaPath = `${linePath} L${points[points.length-1].x},${padding.top + chartHeight} L${points[0].x},${padding.top + chartHeight} Z`;

  // Handle hover over data points
  const handlePointHover = (point) => {
    setTooltipData({
      x: point.x,
      y: point.y,
      value: point.value,
      label: point.label
    });
    setShowTooltip(true);
  };
  
  // Animation variants for smooth transitions
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { 
        pathLength: { type: "spring", duration: 2, bounce: 0 },
        opacity: { duration: 0.5 }
      }
    }
  };
  
  const pointVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (custom) => ({
      scale: 1,
      opacity: 1,
      transition: { 
        delay: custom * 0.1, 
        type: "spring", 
        duration: 0.8, 
        bounce: 0.4 
      }
    })
  };
  
  return (
    <div className="relative">
      <svg 
        ref={svgRef} 
        width={dimensions.width} 
        height={dimensions.height}
        className="overflow-visible"
      >
        {/* Elegant gradient for area fill */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.3)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0.0)" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Grid lines */}
        {[...Array(5)].map((_, i) => {
          const y = padding.top + (i * chartHeight / 4);
          return (
            <line 
              key={`grid-${i}`} 
              x1={padding.left} 
              y1={y} 
              x2={dimensions.width - padding.right} 
              y2={y} 
              stroke="rgba(229, 231, 235, 0.8)" 
              strokeDasharray="4,4"
            />
          );
        })}
        
        {/* X-axis labels */}
        {points.map((point, i) => (
          <text 
            key={`label-${i}`}
            x={point.x}
            y={dimensions.height - 5}
            fontSize="10"
            textAnchor="middle"
            fill="#6B7280"
          >
            {point.label}
          </text>
        ))}
        
        {/* Area fill */}
        <motion.path
          d={areaPath}
          fill="url(#areaGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        
        {/* Line path */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="rgb(99, 102, 241)"
          strokeWidth={3}
          strokeLinecap="round"
          variants={pathVariants}
          initial={animate ? "hidden" : "visible"}
          animate="visible"
          filter="url(#glow)"
        />
        
        {/* Data points with animations */}
        {points.map((point, i) => (
          <motion.circle
            key={`point-${i}`}
            cx={point.x}
            cy={point.y}
            r={activeIndex === i ? 6 : 4}
            fill={activeIndex === i ? "rgb(79, 70, 229)" : "white"}
            stroke="rgb(99, 102, 241)"
            strokeWidth={2}
            custom={i}
            variants={pointVariants}
            initial={animate ? "hidden" : "visible"}
            animate="visible"
            whileHover={{ scale: 1.3 }}
            onMouseEnter={() => {
              handlePointHover(point);
              setActiveIndex(i);
            }}
            onMouseLeave={() => setShowTooltip(false)}
            className="cursor-pointer"
          />
        ))}
        
        {/* Sleek tooltip */}
        {showTooltip && (
          <g>
            <rect
              x={tooltipData.x - 40}
              y={tooltipData.y - 40}
              width={80}
              height={30}
              rx={4}
              fill="rgba(17, 24, 39, 0.9)"
              filter="drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))"
            />
            <text
              x={tooltipData.x}
              y={tooltipData.y - 20}
              textAnchor="middle"
              fill="white"
              fontSize="12"
            >
              {tooltipData.value}
            </text>
          </g>
        )}
      </svg>
      
      {/* Mobile-friendly labels */}
      <div className="mt-3 flex justify-between px-2 text-xs text-gray-500">
        {data.map((item, i) => (
          <div 
            key={`mobile-label-${i}`} 
            className={`cursor-pointer transition-all ${activeIndex === i ? 'text-primary-600 font-medium' : ''}`}
            onClick={() => setActiveIndex(i)}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// Enhanced time period selector with animations
function TimeFilter({ value, onChange }) {
  const options = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];
  
  return (
    <div className="inline-flex rounded-md shadow-sm">
      {options.map((option) => (
        <motion.button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`
            relative inline-flex items-center px-3 py-2 text-sm font-medium
            ${option.value === value 
              ? 'bg-primary-600 text-white z-10' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
            }
            ${option.value === 'day' ? 'rounded-l-md' : ''}
            ${option.value === 'year' ? 'rounded-r-md' : ''}
            border border-gray-300 transition-all duration-200
          `}
          whileTap={{ scale: 0.95 }}
          whileHover={{ 
            y: -2,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" 
          }}
        >
          {option.label}
        </motion.button>
      ))}
    </div>
  );
}

// Main chart component
export default function AnalyticsChart({ loading, title = "Message Activity" }) {
  const [timeFilter, setTimeFilter] = useState('week');
  const [activePointIndex, setActivePointIndex] = useState(null);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  
  // Sample data for different time periods
  const chartData = {
    day: [
      { label: '12AM', value: 5 },
      { label: '4AM', value: 2 },
      { label: '8AM', value: 8 },
      { label: '12PM', value: 12 },
      { label: '4PM', value: 25 },
      { label: '8PM', value: 18 },
    ],
    week: [
      { label: 'Mon', value: 12 },
      { label: 'Tue', value: 19 },
      { label: 'Wed', value: 15 },
      { label: 'Thu', value: 22 },
      { label: 'Fri', value: 30 },
      { label: 'Sat', value: 18 },
      { label: 'Sun', value: 10 },
    ],
    month: [
      { label: 'Week 1', value: 45 },
      { label: 'Week 2', value: 65 },
      { label: 'Week 3', value: 53 },
      { label: 'Week 4', value: 78 },
    ],
    year: [
      { label: 'Jan', value: 120 },
      { label: 'Feb', value: 145 },
      { label: 'Mar', value: 178 },
      { label: 'Apr', value: 250 },
      { label: 'May', value: 210 },
      { label: 'Jun', value: 320 },
      { label: 'Jul', value: 315 },
      { label: 'Aug', value: 350 },
      { label: 'Sep', value: 290 },
      { label: 'Oct', value: 310 },
      { label: 'Nov', value: 285 },
      { label: 'Dec', value: 380 },
    ]
  };
  
  // Trigger animation when time filter changes
  useEffect(() => {
    setShouldAnimate(true);
    setActivePointIndex(null);
    
    // Disable animation after initial render
    const timer = setTimeout(() => {
      setShouldAnimate(false);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [timeFilter]);
  
  if (loading) {
    return <ChartSkeleton />;
  }
  
  const data = chartData[timeFilter];
  const maxValue = Math.max(...data.map(item => item.value)) * 1.2; // Add 20% space at top
  
  return (
    <motion.div 
      className="card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <motion.h2 
          className="font-semibold text-xl"
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.h2>
        <TimeFilter value={timeFilter} onChange={setTimeFilter} />
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={timeFilter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="pt-4"
        >
          <SleekLineChart 
            data={data} 
            maxValue={maxValue} 
            activeIndex={activePointIndex}
            setActiveIndex={setActivePointIndex}
            animate={shouldAnimate}
          />
        </motion.div>
      </AnimatePresence>
      
      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-500">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <span className="font-medium text-gray-700">Total: </span>
          <motion.span
            key={`total-${timeFilter}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {data.reduce((sum, item) => sum + item.value, 0)} messages
          </motion.span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <span className="font-medium text-gray-700">Average: </span>
          <motion.span
            key={`avg-${timeFilter}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {Math.round(data.reduce((sum, item) => sum + item.value, 0) / data.length)} per {
              timeFilter === 'day' ? 'hour' : 
              timeFilter === 'week' ? 'day' : 
              timeFilter === 'month' ? 'week' : 'month'
            }
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  );
} 