import React from 'react';

/**
 * Shimmer skeleton loading component
 * @param {Object} props
 * @param {string} props.className - Additional classes for the skeleton
 * @param {string} props.height - Height of the skeleton
 * @param {string} props.width - Width of the skeleton
 * @param {string} props.borderRadius - Border radius of the skeleton
 */
export function Skeleton({ className = '', height = 'h-6', width = 'w-full', borderRadius = 'rounded-md' }) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 ${height} ${width} ${borderRadius} ${className}`}
    />
  );
}

/**
 * Card skeleton for dashboard stats
 */
export function StatCardSkeleton() {
  return (
    <div className="card">
      <div className="flex items-center">
        <Skeleton width="w-12" height="h-12" borderRadius="rounded-full" />
        <div className="ml-4 space-y-2 w-full">
          <Skeleton height="h-4" width="w-24" />
          <Skeleton height="h-8" width="w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * Chart skeleton
 */
export function ChartSkeleton() {
  return (
    <div className="card space-y-4">
      <Skeleton height="h-4" width="w-48" />
      <div className="space-y-2">
        <Skeleton height="h-32" />
        <div className="flex justify-between">
          <Skeleton height="h-4" width="w-12" />
          <Skeleton height="h-4" width="w-12" />
          <Skeleton height="h-4" width="w-12" />
          <Skeleton height="h-4" width="w-12" />
          <Skeleton height="h-4" width="w-12" />
        </div>
      </div>
    </div>
  );
}

/**
 * Table skeleton
 * @param {Object} props
 * @param {number} props.rows - Number of rows to show
 * @param {number} props.columns - Number of columns
 */
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="card space-y-4">
      <Skeleton height="h-4" width="w-48" />
      <div className="space-y-4">
        {/* Table header */}
        <div className="flex gap-4">
          {Array(columns).fill(0).map((_, i) => (
            <Skeleton key={i} height="h-4" width={`w-1/${columns}`} />
          ))}
        </div>
        
        {/* Table rows */}
        {Array(rows).fill(0).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
            {Array(columns).fill(0).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                height="h-4" 
                width={`w-1/${columns}`} 
                className={colIndex === 0 ? 'w-1/6' : colIndex === columns - 1 ? 'w-1/12' : ''}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Activity feed skeleton
 * @param {Object} props
 * @param {number} props.items - Number of activity items to show
 */
export function ActivityFeedSkeleton({ items = 5 }) {
  return (
    <div className="card space-y-4">
      <Skeleton height="h-4" width="w-48" />
      <div className="space-y-6">
        {Array(items).fill(0).map((_, i) => (
          <div key={i} className="flex space-x-4">
            <Skeleton width="w-10" height="h-10" borderRadius="rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="flex justify-between">
                <Skeleton width="w-32" height="h-4" />
                <Skeleton width="w-16" height="h-4" />
              </div>
              <Skeleton height="h-4" width="w-full" />
              <Skeleton height="h-4" width="w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default {
  Skeleton,
  StatCardSkeleton,
  ChartSkeleton,
  TableSkeleton,
  ActivityFeedSkeleton
}; 