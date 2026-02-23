import AuthProvider from "@/common/providers/AuthProvider";
import ReactQueryProvider from "@/common/providers/QueryProvider";
import { ToastProvider } from "@/common/providers/ToastProvider";
import "./globals.css";
import { ConfirmProvider } from "@/common/providers/ConfirmProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-full w-full">
        <ReactQueryProvider>
          <ToastProvider>
            <AuthProvider>
              <ConfirmProvider>
                <TooltipProvider>{children}</TooltipProvider>
              </ConfirmProvider>
            </AuthProvider>
          </ToastProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
