import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileNavigation } from "./MobileNavigation";

export const Layout = (): JSX.Element => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Detecta se é mobile
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      if (!isMobileView) {
        setIsSidebarExpanded(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    // Abrir sidebar apenas quando o swipe começa na borda esquerda (<= 30px)
    if (isRightSwipe && isMobile && !isSidebarExpanded && (touchStart ?? 0) <= 30) {
      setIsSidebarExpanded(true);
    }
    // Fechar sidebar em swipe da direita para a esquerda
    else if (isLeftSwipe && isMobile && isSidebarExpanded) {
      setIsSidebarExpanded(false);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div 
      className="flex h-screen bg-gray-50"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sidebar */}
      <Sidebar isExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar} />

      {/* Conteúdo principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          toggleSidebar={toggleSidebar} 
          isMobile={isMobile} 
          isExpanded={isSidebarExpanded}
        />
        
        {/* Área de conteúdo */}
        <main 
          className={`flex-1 overflow-auto p-4 sm:p-6 transition-all duration-300 ${
            isSidebarExpanded && !isMobile ? "md:ml-64" : "md:ml-24"
          }`}
        >
          <div className="container mx-auto p-0">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Navegação Mobile */}
      <MobileNavigation 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </div>
  );
};