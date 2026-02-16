"use client";
import { useAuth } from "@/features/auth/hooks";
import { LoginResquest } from "@/features/auth/interfaces";
import { useToast } from "@/common/providers/ToastProvider";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginResquest>({
    username: "",
    password: "",
  });

  const { login } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      showToast("Vui lòng nhập đầy đủ thông tin!", "error");
      return;
    }

    login.mutate(formData, {
      onSuccess: (response) => {
        showToast("Đăng nhập thành công!", "success");
        router.push("/");
      },
      onError: (error: any) => {
        const errorMsg =
          error.response?.data?.message || "Email hoặc mật khẩu không hợp lệ";
        showToast(errorMsg, "error");
      },
    });
  };

  return (
    <div 
      className="min-h-screen text-gray-900 flex justify-center items-center p-4"
      style={{
        backgroundImage: 'url(/bg-login.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="bg-white/30 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="HTECH Logo" className="h-12 w-auto" />
        </div>
        {/* Thêm onSubmit vào form để hỗ trợ nhấn Enter */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tên đăng nhập
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập"
              disabled={login.isPending}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={login.isPending}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {/* Nút ẩn/hiện mật khẩu */}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                disabled={login.isPending}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-lg transition duration-300 shadow-md hover:shadow-lg mt-2 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {login.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>

          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              Bạn chưa có tài khoản?{" "}
              <a
                href="/register"
                className={`text-blue-600 font-semibold hover:underline ${
                  login.isPending ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Đăng ký ngay
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
