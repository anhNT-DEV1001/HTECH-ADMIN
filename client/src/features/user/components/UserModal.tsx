"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { CircleX, Eye, EyeOff, Loader2, Save } from "lucide-react";
import { IUserResponse, IUserForm } from "../interfaces/user.interface";
import {DraggableModal} from "@/common/components/ui/Modal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: IUserForm) => void;
  initialData?: IUserResponse | null;
  loading?: boolean;
}

export default function UserModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  loading = false,
}: UserModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IUserForm>();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setValue("username", initialData.username);
        setValue("email", initialData.email);
        setValue("fullName", initialData.fullName);
        setValue("phone", initialData.phone);
        if (initialData.dob) {
          const date = new Date(initialData.dob);
          const formatted = date.toISOString().split("T")[0];
          setValue("dob", formatted as any);
        }
        setValue("password", "");
      } else {
        reset({
          username: "",
          email: "",
          fullName: "",
          phone: "",
          password: "",
          dob: undefined,
        });
      }
    }
  }, [isOpen, initialData, reset, setValue]);

  const password = watch("password");
  const isUpdateMode = !!initialData;

  const onSubmit = (data: IUserForm) => {
    onSave(data);
  };

  return (
    <DraggableModal
      open={isOpen}
      title={isUpdateMode ? "Cập nhật người dùng" : "Thêm người dùng mới"}
      onClose={onClose}
      width="max-w-2xl"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            type="button"
            disabled={loading}
          >
            <CircleX size={16}/>
            Hủy bỏ
          </Button>
          <Button
            form="user-form"
            type="submit"
            disabled={loading}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {!loading && <Save size={16}/>}
            {isUpdateMode ? "Cập nhật" : "Tạo mới"}
          </Button>
        </>
      }
    >
      <div className="max-h-[75vh] overflow-y-auto custom-scrollbar">
        <form
          id="user-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div className="space-y-1.5">
              <Label>
                Tên đăng nhập <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("username", { required: "Tên đăng nhập là bắt buộc" })}
                placeholder="Nhập tên đăng nhập"
                disabled={isUpdateMode}
                aria-invalid={errors.username ? true : undefined}
              />
              {errors.username && (
                <p className="text-red-500 text-xs">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label>
                Họ và tên <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("fullName", { required: "Họ và tên là bắt buộc" })}
                placeholder="Nhập họ và tên"
                aria-invalid={errors.fullName ? true : undefined}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label>
                Mật khẩu {isUpdateMode ? "" : <span className="text-red-500">*</span>}
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: isUpdateMode
                      ? false
                      : "Mật khẩu là bắt buộc",
                    minLength: {
                      value: 6,
                      message: "Mật khẩu phải có ít nhất 6 ký tự",
                    },
                  })}
                  placeholder={
                    isUpdateMode
                      ? "Để trống nếu không đổi"
                      : "Nhập mật khẩu"
                  }
                  className="pr-10"
                  aria-invalid={errors.password ? true : undefined}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label>
                Nhập lại mật khẩu {isUpdateMode ? "" : <span className="text-red-500">*</span>}
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword" as any, {
                    validate: (val: string) => {
                      if (isUpdateMode && !password) return true;
                      if (!val && !isUpdateMode)
                        return "Vui lòng nhập lại mật khẩu";
                      if (val !== password)
                        return "Mật khẩu không khớp";
                    },
                  })}
                  placeholder="Nhập lại mật khẩu"
                  className="pr-10"
                  aria-invalid={errors["confirmPassword" as keyof IUserForm] ? true : undefined}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </Button>
              </div>
              {/* @ts-ignore */}
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs">
                    {/* @ts-ignore */}
                  {errors.confirmPassword.message as any}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label>
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                {...register("email", {
                  required: "Email là bắt buộc",
                  pattern: {
                    value:
                      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email không hợp lệ",
                  },
                })}
                placeholder="name@example.com"
                aria-invalid={errors.email ? true : undefined}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label>
                Số điện thoại <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("phone", {
                  required: "Số điện thoại là bắt buộc",
                })}
                placeholder="Nhập số điện thoại"
                aria-invalid={errors.phone ? true : undefined}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* DOB */}
            <div className="space-y-1.5">
              <Label>
                Ngày sinh <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                {...register("dob", { required: "Ngày sinh là bắt buộc" })}
                aria-invalid={errors.dob ? true : undefined}
              />
              {errors.dob && (
                <p className="text-red-500 text-xs">
                  {errors.dob.message}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </DraggableModal>
  );
}
