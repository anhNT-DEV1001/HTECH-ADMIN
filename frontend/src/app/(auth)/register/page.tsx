"use client";
import { useAuth } from "@/apis/auth/hooks";
import { ResginterRequest } from "@/apis/auth/interfaces";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRepet, setShowPasswordRepet] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [formData, setFormData] = useState<ResginterRequest>({
    username: "",
    password: "",
    email: "",
    phone: "",
    dob: "",
    name: "",
  });
  const { register } = useAuth();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const togglePasswordRepetVisibility = () => {
    setShowPasswordRepet(!showPasswordRepet);
  };
  const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password" || name === "confirmPassword") {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setConfirmPassword(e.target.value);
    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePasswords = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
    }
    if (
      formData.password &&
      confirmPassword &&
      formData.password !== confirmPassword
    ) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form data:", formData);
    if (validatePasswords()) {
      console.log("Form data:", formData);
      register.mutate(formData, {
        onSuccess: (response) => {
          alert("Đăng nhập thành công !");
          router.push("/login");
        },
        onError: (error: any) => {
          const errorMsg =
            error.response?.data?.message || "Email hoặc mật khẩu không hợp lệ";
          alert(errorMsg);
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-4xl">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-600 tracking-tight">
            HTECH Trang quản trị
          </h1>
          <p className="text-gray-500 mt-2">Đăng ký tài khoản mới</p>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* --- Cột 1: Thông tin tài khoản --- */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Thông tin đăng nhập
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="Vui lòng nhập tên đăng nhập"
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Vui lòng nhập mật khẩu"
                    className={`w-full border rounded-lg p-3 outline-none focus:ring-2 transition-all ${
                      errors.password
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-blue-400"
                    }`}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhập lại mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPasswordRepet ? "text" : "password"}
                    placeholder="Vui lòng nhập mật khẩu"
                    className={`w-full border rounded-lg p-3 outline-none focus:ring-2 transition-all ${
                      errors.confirmPassword
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-blue-400"
                    }`}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                  />
                  <button
                    id="repetPass"
                    type="button"
                    onClick={togglePasswordRepetVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600"
                  >
                    {showPasswordRepet ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* --- Cột 2: Thông tin cá nhân --- */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Thông tin cá nhân
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nhập tên của bạn"
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email của bạn"
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Số điện thoại"
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="dob"
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-600"
                    value={formData.dob as string}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Nút bấm và link điều hướng */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-xl transition duration-300 shadow-lg flex justify-center items-center gap-2"
            >
              <UserPlus size={20} />
              Tạo tài khoản
            </button>

            <div className="text-center mt-6">
              <p className="text-gray-500 text-sm">
                Bạn đã có tài khoản?{" "}
                <a
                  href="/login"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Đăng nhập
                </a>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
