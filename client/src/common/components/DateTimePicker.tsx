"use client";

import * as React from "react";
import { format, setHours, setMinutes } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export type DateTimePickerMode = "date" | "date-time" | "time";

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  mode?: DateTimePickerMode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  mode = "date",
  placeholder = "Chọn thời gian",
  disabled = false,
  className,
}: DateTimePickerProps) {
  // Xác định định dạng hiển thị ra bên ngoài dựa trên mode
  const displayFormat =
    mode === "time"
      ? "HH:mm"
      : mode === "date-time"
      ? "dd/MM/yyyy HH:mm"
      : "dd/MM/yyyy";

  // Xử lý khi chọn ngày trên Calendar
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange(undefined);
      return;
    }
    // Nếu đang ở mode date-time, giữ nguyên giờ/phút hiện tại của value
    if (mode === "date-time" && value) {
      const newDate = setHours(
        setMinutes(selectedDate, value.getMinutes()),
        value.getHours()
      );
      onChange(newDate);
    } else {
      onChange(selectedDate);
    }
  };

  // Xử lý khi thay đổi giờ/phút
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value; // Format: "HH:mm"
    if (!timeValue) return;

    const [hours, minutes] = timeValue.split(":").map(Number);

    // Nếu chưa có ngày (value đang undefined), lấy ngày hôm nay làm gốc
    const dateToUpdate = value || new Date();
    const newDate = setHours(setMinutes(dateToUpdate, minutes), hours);

    onChange(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {mode === "time" ? (
            <Clock className="mr-2 h-4 w-4" />
          ) : (
            <CalendarIcon className="mr-2 h-4 w-4" />
          )}
          {value ? format(value, displayFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        {/* Phần Lịch - Ẩn đi nếu chỉ là mode 'time' */}
        {mode !== "time" && (
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            initialFocus
          />
        )}

        {/* Phần chọn Giờ - Ẩn đi nếu chỉ là mode 'date' */}
        {mode !== "date" && (
          <div className={cn("p-3 flex items-center justify-between", mode === "date-time" && "border-t border-border mt-1")}>
            <span className="text-sm font-medium">Thời gian</span>
            <Input
              type="time"
              value={value ? format(value, "HH:mm") : ""}
              onChange={handleTimeChange}
              className="w-[120px]"
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}