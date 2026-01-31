import AuthProvider from "@/common/providers/AuthProvider";
import ReactQueryProvider from "@/common/providers/QueryProvider";
import { ToastProvider } from "@/common/providers/ToastProvider";
import "@/public/styles/globals.css";
import { ConfirmProvider } from "@/common/providers/ConfirmProvider";


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
              <ConfirmProvider>{children}</ConfirmProvider>
            </AuthProvider>
          </ToastProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
