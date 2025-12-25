import { useEffect, useRef, useState } from 'react';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private startTimes: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start timing an operation
  startTiming(operation: string): void {
    this.startTimes.set(operation, Date.now());
  }

  // End timing and record the duration
  endTiming(operation: string): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) {
      console.warn(`No start time found for operation: ${operation}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.recordMetric(operation, duration);
    this.startTimes.delete(operation);
    
    return duration;
  }

  // Record a metric value
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only the last 100 measurements to prevent memory leaks
    if (values.length > 100) {
      values.shift();
    }
  }

  // Get statistics for a metric
  getMetricStats(name: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    latest: number;
  } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) {
      return null;
    }

    const count = values.length;
    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = sum / count;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const latest = values[values.length - 1];

    return { count, average, min, max, latest };
  }

  // Get all metrics
  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [name] of this.metrics) {
      result[name] = this.getMetricStats(name);
    }
    
    return result;
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics.clear();
    this.startTimes.clear();
  }

  // Log performance summary
  logSummary(): void {
    const metrics = this.getAllMetrics();
    console.log('Performance Summary:', metrics);
  }
}

// Hook for monitoring component render performance
export const useRenderPerformance = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const monitor = PerformanceMonitor.getInstance();

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    monitor.recordMetric(`${componentName}_render_interval`, timeSinceLastRender);
    lastRenderTime.current = now;

    if (__DEV__ && renderCount.current % 10 === 0) {
      console.log(`${componentName} rendered ${renderCount.current} times`);
    }
  });

  return {
    renderCount: renderCount.current,
    getStats: () => monitor.getMetricStats(`${componentName}_render_interval`),
  };
};

// Hook for monitoring API call performance
export const useApiPerformance = () => {
  const monitor = PerformanceMonitor.getInstance();

  const trackApiCall = (endpoint: string, method: string = 'GET') => {
    const operationName = `api_${method.toLowerCase()}_${endpoint}`;
    
    return {
      start: () => monitor.startTiming(operationName),
      end: () => {
        const duration = monitor.endTiming(operationName);
        
        if (__DEV__) {
          console.log(`API ${method} ${endpoint} took ${duration}ms`);
        }
        
        return duration;
      },
      getStats: () => monitor.getMetricStats(operationName),
    };
  };

  return { trackApiCall };
};

// Hook for monitoring memory usage (React Native specific)
export const useMemoryMonitor = (interval: number = 10000) => {
  const [memoryInfo, setMemoryInfo] = useState<any>(null);

  useEffect(() => {
    const checkMemory = () => {
      // In React Native, you can use performance.memory if available
      if (global.performance && global.performance.memory) {
        setMemoryInfo({
          usedJSHeapSize: global.performance.memory.usedJSHeapSize,
          totalJSHeapSize: global.performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: global.performance.memory.jsHeapSizeLimit,
        });
      }
    };

    checkMemory();
    const intervalId = setInterval(checkMemory, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return memoryInfo;
};

// Utility function to measure function execution time
export const measureExecutionTime = async <T>(
  fn: () => Promise<T> | T,
  operationName?: string
): Promise<{ result: T; duration: number }> => {
  const startTime = Date.now();
  
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    
    if (operationName && __DEV__) {
      console.log(`${operationName} executed in ${duration}ms`);
    }
    
    return { result, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (operationName && __DEV__) {
      console.log(`${operationName} failed after ${duration}ms`);
    }
    
    throw error;
  }
};

// Debounce utility for performance optimization
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle utility for performance optimization
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCall = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useRef((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      return callback(...args);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastCall.current = Date.now();
        callback(...args);
      }, delay - (now - lastCall.current));
    }
  }).current as T;
};