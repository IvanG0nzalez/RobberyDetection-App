"use client";

import { useEffect, useRef } from "react";

export default function ReportIframe({ type }: { type: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    const themeParams = isDark ? 'dark' : 'light';
    const initSrc = `/api/report?type=${type}&theme=${themeParams}`;
    
    if (iframeRef.current && iframeRef.current.src === '') {
        iframeRef.current.src = initSrc;
    }

    // Pasar el contexto de tema más reciente dinámicamente a la ventana del iframe hijo cada vez que el usuario cambie el tema fuera del alcance del iframe
    const observer = new MutationObserver(() => {
      const isCurrentlyDark = document.documentElement.classList.contains('dark');
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          isCurrentlyDark ? 'theme-dark' : 'theme-light', 
          '*'
        );
      }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, [type]);

  return (
    <div className="bg-card w-full h-[calc(100vh-140px)] border border-line rounded-xl overflow-hidden shadow-sm">
      <iframe 
        ref={iframeRef}
        className="w-full h-full border-0 bg-bg transition-colors duration-300"
        sandbox="allow-scripts allow-same-origin"
        title="Report Viewer"
      />
    </div>
  );
}