"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { LockIcon, LogInIcon, User, Loader2, Eye, EyeOff } from "lucide-react"
import { LoginFormValues, loginSchema } from "./validates"
import { useAuth } from "./hooks"
import { useRouter } from "next/navigation"
import { useToast } from "@/common/providers/ToastProvider"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const { login, isLoading} = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const onSubmit = async (data: LoginFormValues) => {
    try {
      login.mutate(data , {
        onSuccess: (response) => {
          router.push("/");
          showToast("Đăng nhập thành công !" , 'success');
        },
        onError: (response : any) => {
          const errorMsg =
            response.response?.data?.message || "Email hoặc mật khẩu không hợp lệ";
          showToast(errorMsg, "error");
        }
      })
    } catch (error) {
      showToast("Lỗi hệ thống, vui lòng thử lại sau !", 'error');
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-white/40 backdrop-blur-lg border border-white/50 shadow-2xl rounded-2xl overflow-hidden p-2 dark:bg-black/40 dark:border-white/20">
        <CardHeader className="pb-4 items-center flex-col justify-center">
          <Image 
            src="/logo.png" 
            alt="App Logo" 
            width={120} 
            height={120} 
            className="object-contain drop-shadow-md"
            priority
          />
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">
                  <User size={20}/>
                  <span>Tên đăng nhập</span>
                </FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="Vui lòng nhập tên đăng nhập !"
                  disabled={isSubmitting}
                  {...register("username")}
                  className={errors.username ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username.message}</p>
                )}
              </Field>

              {/* Trường Password */}
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">
                    <LockIcon size={20}/>
                    <span>Mật khẩu</span>
                  </FieldLabel>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Vui lòng nhập mật khẩu !"
                    disabled={isSubmitting}
                    {...register("password")}
                    className={cn(
                      "pr-10",
                      errors.password ? "border-red-500 focus-visible:ring-red-500" : ""
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff size={16} className="text-muted-foreground" />
                    ) : (
                      <Eye size={16} className="text-muted-foreground" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="animate-spin mr-2" size={16} />
                  ) : (
                    <LogInIcon className="mr-2" size={16} />
                  )}
                  <span>{isLoading ? "Đang xử lý..." : "Đăng nhập"}</span>
                </Button>
              </Field>

            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}