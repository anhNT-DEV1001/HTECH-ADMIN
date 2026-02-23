import { LoginForm } from "@/features/auth/LoginForm"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 relative bg-[url('/bg-login.png')] bg-cover bg-center bg-no-repeat">
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative z-10 w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
