'use client';
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import { IUserResponse, IUserForm } from "../interfaces/user.interface";
import React, { useState } from "react";

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
            const formatted = date.toISOString().split('T')[0];
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
            dob: undefined
        });
      }
    }
  }, [isOpen, initialData, reset, setValue]);

  const password = watch("password");
  
  const onSubmit = (data: IUserForm) => {
    onSave(data);
  };

  if (!isOpen) return null;

  const isUpdateMode = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl  max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {isUpdateMode ? `Cập nhật người dùng` : "Thêm người dùng mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                        Tên đăng nhập <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("username", { required: "Tên đăng nhập là bắt buộc" })}
                        className={`w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 transition-all ${errors.username ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-100"}`}
                        placeholder="Nhập tên đăng nhập"
                        disabled={isUpdateMode}
                    />
                    {errors.username && <p className="text-red-500 text-xs">{errors.username.message}</p>}
                </div>

                {/* Full Name */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                        Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("fullName", { required: "Họ và tên là bắt buộc" })}
                        className={`w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 transition-all ${errors.fullName ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-100"}`}
                        placeholder="Nhập họ và tên"
                    />
                    {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
                </div>
                
                {/* Password - Conditional Requirement */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                        Mật khẩu {isUpdateMode ? "" : <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            {...register("password", { 
                                required: isUpdateMode ? false : "Mật khẩu là bắt buộc",
                                minLength: { value: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
                            })}
                            className={`w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 transition-all ${errors.password ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-100"}`}
                            placeholder={isUpdateMode ? "Để trống nếu không đổi" : "Nhập mật khẩu"}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                        Nhập lại mật khẩu {isUpdateMode ? "" : <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            {...register("confirmPassword" as any, { 
                                validate: (val: string) => {
                                    if (isUpdateMode && !password) return true;
                                    if (!val && !isUpdateMode) return "Vui lòng nhập lại mật khẩu";
                                    if (val !== password) return "Mật khẩu không khớp";
                                },
                            })}
                            className={`w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 transition-all ${errors["confirmPassword" as keyof IUserForm] ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-100"}`} // casting keyof because interface doesn't have confirmPassword
                            placeholder="Nhập lại mật khẩu"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                     {/* @ts-ignore */}
                    {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        {...register("email", { 
                            required: "Email là bắt buộc",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Email không hợp lệ"
                            }
                        })}
                        className={`w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 transition-all ${errors.email ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-100"}`}
                        placeholder="name@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                </div>

                 {/* Phone */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                        Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("phone", { required: "Số điện thoại là bắt buộc" })}
                        className={`w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 transition-all ${errors.phone ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-100"}`}
                        placeholder="Nhập số điện thoại"
                    />
                    {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                </div>

                {/* DOB */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                        Ngày sinh <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        {...register("dob", { required: "Ngày sinh là bắt buộc" })}
                        className={`w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 transition-all ${errors.dob ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-100"}`}
                    />
                    {errors.dob && <p className="text-red-500 text-xs">{errors.dob.message}</p>}
                </div>
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 hover:bg-white border border-transparent hover:border-gray-200 text-gray-600 rounded-lg transition-all"
          >
            Hủy bỏ
          </button>
          <button
            form="user-form"
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all shadow-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {isUpdateMode ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </div>
    </div>
  );
}