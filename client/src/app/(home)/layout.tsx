import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/common/components/ui/AppSidebar"
import { AppHeader } from "@/common/components/ui/AppHeader"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col flex-1 w-full h-screen overflow-hidden">
        <AppHeader />
        <main className="bg-white flex-1 p-6 overflow-auto">
          <div className=" rounded-xl shadow-sm border border-slate-200 min-h-full p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}