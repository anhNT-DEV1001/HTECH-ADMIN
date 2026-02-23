import { useEffect, useState, useCallback } from "react";

/**
 * @description Hook giúp trì hoãn việc gọi callback (debounce)
 * @param callback Hàm callback cần debounce
 * @param delay Thời gian chờ (ms), mặc định là 500ms
 */
export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 500
): T {
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    ((...args: any[]) => {
      if (timerId) {
        clearTimeout(timerId);
      }
      const newTimerId = setTimeout(() => {
        callback(...args);
      }, delay);
      setTimerId(newTimerId);
    }) as T,
    [callback, delay, timerId]
  );

  useEffect(() => {
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [timerId]);

  return debouncedCallback;
}

/**
 * @description Hook giúp trì hoãn việc cập nhật giá trị (debounce value)
 * @param value Giá trị cần debounce (thường là string từ ô input)
 * @param delay Thời gian chờ (ms), mặc định là 500ms
 */
export function useDebouncedValue<T>(value: T, delay: number = 500): T {
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
}
