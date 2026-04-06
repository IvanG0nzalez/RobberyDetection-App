import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import DashboardLayout from "@/components/ui/DashboardLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inferencia - Analizar Video",
  description: "Sistema de Inferencia para detectar Robo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className}`}>
        <DashboardLayout>
          {children}
        </DashboardLayout>

        {/* Notificaciones globales */}
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          theme="colored" 
        />
      </body>
    </html>
  );
}