"use client";

import { useState, useEffect } from "react";
import { Menu, X, FileVideo, ShieldAlert, Info, ChevronDown, ChevronUp, BarChart2, GitCompare, Trophy, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const [isAboutOpen, setIsAboutOpen] = useState(() => {
    return typeof window !== "undefined" && window.location.pathname.startsWith("/acerca-de");
  });

  useEffect(() => {
    if (pathname.startsWith("/acerca-de")) {
      setIsAboutOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    // Revisión inicial
    handleResize();
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg text-ink relative">
      {/* Overlay móvil */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:relative flex flex-col z-50 h-full bg-card border-r border-line transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "w-64 translate-x-0" : isMobile ? "-translate-x-full w-64" : "w-20 translate-x-0"}`}
      >
        <div className="h-16 flex items-center justify-between px-4 text-brand">
          {(isSidebarOpen || isMobile) ? (
            <div className="flex items-center gap-3 font-extrabold text-xl overflow-hidden whitespace-nowrap">
              <ShieldAlert className="flex-shrink-0" />
              <span>Securify</span>
            </div>
          ) : (
            <div className="mx-auto">
              <ShieldAlert className="flex-shrink-0" />
            </div>
          )}
          
          {isMobile && (
            <button className="text-muted hover:text-ink" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 p-4 overflow-y-auto w-full">
          <ul className="flex flex-col gap-2 w-full">
            <li>
              <Link 
                href="/" 
                className={`flex w-full items-center p-3 rounded-md font-medium transition-colors ${pathname === "/" ? "bg-brand/10 text-brand" : "text-muted hover:bg-line/20 hover:text-ink"}
                  ${(!isSidebarOpen && !isMobile) ? "justify-center" : "gap-3"}`}
                title={(!isSidebarOpen && !isMobile) ? "Analizar Video" : ""}
              >
                <FileVideo size={20} className="flex-shrink-0" />
                {(isSidebarOpen || isMobile) && <span className="whitespace-nowrap">Analizar Video</span>}
              </Link>
            </li>

            <li>
              <Link 
                href="/modo-de-uso" 
                className={`flex w-full items-center p-3 rounded-md font-medium transition-colors ${pathname === "/modo-de-uso" ? "bg-brand/10 text-brand" : "text-muted hover:bg-line/20 hover:text-ink"}
                  ${(!isSidebarOpen && !isMobile) ? "justify-center" : "gap-3"}`}
                title={(!isSidebarOpen && !isMobile) ? "Modo de uso" : ""}
              >
                <BookOpen size={20} className="flex-shrink-0" />
                {(isSidebarOpen || isMobile) && <span className="whitespace-nowrap">Modo de uso</span>}
              </Link>
            </li>

            <li className="mt-2 pt-2 border-t border-line/50">
              <button 
                onClick={() => { setIsAboutOpen(!isAboutOpen); if (!isSidebarOpen) setIsSidebarOpen(true); }}
                className={`flex w-full items-center justify-between p-3 rounded-md font-medium transition-colors text-muted hover:bg-line/20 hover:text-ink
                  ${(!isSidebarOpen && !isMobile) ? "justify-center" : "gap-3"}`}
                title={(!isSidebarOpen && !isMobile) ? "Acerca de" : ""}
              >
                <div className="flex items-center gap-3 w-full">
                   <Info size={20} className="flex-shrink-0" />
                   {(isSidebarOpen || isMobile) && <span className="whitespace-nowrap">Acerca de</span>}
                </div>
                {(isSidebarOpen || isMobile) && (
                  isAboutOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                )}
              </button>
              
              {/* Dropdown menu items */}
              {isAboutOpen && (isSidebarOpen || isMobile) && (
                <ul className="mt-2 flex flex-col gap-1 pl-4 border-l-2 border-line/30 ml-6 pb-2 transition-all">
                  <li>
                    <Link href="/acerca-de/eda" className={`flex w-full items-center gap-3 p-2 rounded-md font-medium transition-colors ${pathname === "/acerca-de/eda" ? "text-brand bg-brand/10" : "text-muted hover:text-ink"}`}>
                      <BarChart2 size={16} /> <span className="text-sm whitespace-nowrap">Análisis EDA</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/acerca-de/comparacion" className={`flex w-full items-center gap-3 p-2 rounded-md font-medium transition-colors ${pathname === "/acerca-de/comparacion" ? "text-brand bg-brand/10" : "text-muted hover:text-ink"}`}>
                      <GitCompare size={16} /> <span className="text-sm whitespace-nowrap">Comparar Exp.</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/acerca-de/mejor-modelo" className={`flex w-full items-center gap-3 p-2 rounded-md font-medium transition-colors ${pathname === "/acerca-de/mejor-modelo" ? "text-brand bg-brand/10" : "text-muted hover:text-ink"}`}>
                      <Trophy size={16} /> <span className="text-sm whitespace-nowrap">Mejor Modelo</span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Topbar */}
        <header className="h-16 bg-card border-b border-line flex items-center justify-between px-4 md:px-6 z-10 flex-shrink-0">
          <div className="flex items-center">
            <button 
              className="p-2 rounded-md hover:bg-line/20 text-muted hover:text-ink transition-colors flex items-center justify-center -ml-2"
              onClick={toggleSidebar}
              title="Alternar menú"
            >
              <Menu size={24} />
            </button>
          </div>
          
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        
        {/* Contenido de la página */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 h-full relative">
           {children}
        </main>
      </div>
    </div>
  );
}