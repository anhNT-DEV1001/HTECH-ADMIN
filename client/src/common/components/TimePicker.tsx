"use client";

import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const normalizeTime = (value: string) => {
  if (!value) return "";
  return value.slice(0, 5);
};

export function TimePicker({
  value,
  onChange,
  placeholder = "Chọn giờ",
  disabled = false,
  className,
}: TimePickerProps) {
  const timeValue = normalizeTime(value || "");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !timeValue && "text-muted-foreground",
            className,
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {timeValue || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-3" align="start">
        <div className="space-y-2">
          <div className="text-sm font-medium">Thời gian</div>
          <Input
            type="time"
            value={timeValue}
            onChange={(event) => onChange(normalizeTime(event.target.value))}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
