import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAccessibility } from "@/hooks/useAccessibility";
import { Menu, ChevronLeft, ChevronRight, Settings, User, LogOut, Info, Plus, Minus, Contrast, Moon, Sun, Zap, ZapOff, Volume2, VolumeX, Monitor, Type, Palette, Activity, HelpCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { KeyboardShortcuts, AccessibilityHelp } from "@/components/accessibility/KeyboardShortcuts";
import { VoiceCommandButton } from "@/components/accessibility/VoiceCommandButton";
import { type Theme } from "@/utils/theme";

interface HeaderProps {
  toggleSidebar: () => void;
  isMobile: boolean;
  isExpanded: boolean;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, isMobile, isExpanded }) => {
  const { user, logout } = useAuth();
  const {
    settings: accessibilitySettings,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    toggleHighContrast,
    setThemeMode,
    toggleReduceMotion,
    toggleSound,
    resetAllSettings,
    playSound,
    announceToScreenReader,
  } = useAccessibility();
  
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Estados para controlar a exibição dos modais
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  
  // Estados para controlar o gesto de swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Fecha o menu quando clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;

      // Em desktop, sempre mostra o header
      if (window.innerWidth >= 768) {
        setShowHeader(true);
        return;
      }

      // Em mobile, esconde quando rola para baixo
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlHeader);
    return () => window.removeEventListener("scroll", controlHeader);
  }, [lastScrollY]);

  const handleUserMenuClick = () => {
    setShowUserMenu(!showUserMenu);
    playSound('click');
  };

  const handleMenuItemClick = (action: string) => {
    setShowUserMenu(false);
    playSound('click');
    
    switch (action) {
      case "accessibility":
        setIsAccessibilityModalOpen(true);
        announceToScreenReader("Configurações de acessibilidade aberta");
        break;
      case "profile":
        setIsProfileModalOpen(true);
        announceToScreenReader("Modal de alteração de dados aberto");
        break;
      case "logout":
        logout();
        navigate("/login");
        announceToScreenReader("Logout realizado com sucesso");
        break;
      default:
        break;
    }
  };

  // Handlers para gesto de swipe
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
    
    if (isRightSwipe && isMobile && !isExpanded && (touchStart ?? 0) <= 30) {
      toggleSidebar();
      playSound('click');
    }
    else if (isLeftSwipe && isMobile && isExpanded) {
      toggleSidebar();
      playSound('click');
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Handler para botões de acessibilidade com feedback
  const handleAccessibilityAction = (action: () => void, message: string) => {
    action();
    playSound('success');
    announceToScreenReader(message);
  };

  // Handler para mudança de tema
  const handleThemeChange = (theme: Theme) => {
    setThemeMode(theme);
    playSound('success');
    const themeNames = {
      light: 'tema claro',
      dark: 'tema escuro',
      system: 'tema do sistema'
    };
    announceToScreenReader(`${themeNames[theme]} ativado`);
  };

  // Handler para abrir modal de acessibilidade via atalho
  const handleToggleAccessibilityModal = () => {
    setIsAccessibilityModalOpen(!isAccessibilityModalOpen);
  };

  // Componente interno de toggle switch
  const Toggle = ({ active }: { active: boolean }) => (
    <div
      className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200 ${
        active ? 'bg-[#ae0f0a]' : 'bg-gray-300'
      }`}
      aria-hidden="true"
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
        active ? 'translate-x-5' : 'translate-x-0.5'
      }`} />
    </div>
  );

  return (
    <>
      {/* Atalhos de teclado */}
      <KeyboardShortcuts onToggleAccessibilityMenu={handleToggleAccessibilityModal} />
      
      {/* Link para pular ao conteúdo principal */}
      <a
        id="skip-to-main"
        href="#main-content"
        className="skip-link"
        onFocus={() => announceToScreenReader('Link para pular ao conteúdo principal')}
      >
        Pular para conteúdo principal
      </a>

      <header 
        className={`sticky top-0 bg-white border-b border-gray-200 h-16 z-40 transition-all duration-300 ${showHeader ? 'transform-none' : '-translate-y-full'} ${isMobile ? 'ml-0' : isExpanded ? 'ml-60' : 'ml-20'}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="banner"
        aria-label="Cabeçalho principal"
      >
        <div className="h-full px-2 sm:px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => {
                toggleSidebar();
                playSound('click');
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors accessibility-focus"
              aria-label={isMobile ? "Toggle mobile menu" : (isExpanded ? "Recolher menu" : "Expandir menu")}
            >
              {isMobile ? (
                <Menu className="h-5 w-5 text-gray-700" />
              ) : isExpanded ? (
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-700" />
              )}
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">PGA</h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 relative">
            <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline-block truncate max-w-[100px] md:max-w-none">
              {user?.nome}
            </span>

            {/* Botão de comando de voz */}
            <VoiceCommandButton
              onDarkMode={() => handleThemeChange('dark')}
              onLightMode={() => handleThemeChange('light')}
              onSystemMode={() => handleThemeChange('system')}
              onIncreaseFontSize={() => handleAccessibilityAction(increaseFontSize, 'Fonte aumentada')}
              onDecreaseFontSize={() => handleAccessibilityAction(decreaseFontSize, 'Fonte diminuída')}
              onResetFontSize={() => handleAccessibilityAction(resetFontSize, 'Fonte restaurada')}
              onToggleHighContrast={(direction) => {
                if (direction === 'enable' && accessibilitySettings.highContrast) {
                  announceToScreenReader('Alto contraste já está ativado');
                  return;
                }
                if (direction === 'disable' && !accessibilitySettings.highContrast) {
                  announceToScreenReader('Alto contraste já está desativado');
                  return;
                }
                handleAccessibilityAction(toggleHighContrast, accessibilitySettings.highContrast ? 'Alto contraste desativado' : 'Alto contraste ativado');
              }}
              onToggleReduceMotion={(direction) => {
                if (direction === 'enable' && accessibilitySettings.reduceMotion) {
                  announceToScreenReader('Redução de movimento já está ativada');
                  return;
                }
                if (direction === 'disable' && !accessibilitySettings.reduceMotion) {
                  announceToScreenReader('Redução de movimento já está desativada');
                  return;
                }
                handleAccessibilityAction(toggleReduceMotion, accessibilitySettings.reduceMotion ? 'Redução de movimento desativada' : 'Redução de movimento ativada');
              }}
              onToggleSound={(direction) => {
                if (direction === 'enable' && accessibilitySettings.soundEnabled) {
                  announceToScreenReader('Sons do sistema já estão ativados');
                  return;
                }
                if (direction === 'disable' && !accessibilitySettings.soundEnabled) {
                  announceToScreenReader('Sons do sistema já estão desativados');
                  return;
                }
                handleAccessibilityAction(toggleSound, accessibilitySettings.soundEnabled ? 'Sons do sistema desativados' : 'Sons do sistema ativados');
              }}
              onOpenAccessibility={handleToggleAccessibilityModal}
              onAnnounce={announceToScreenReader}
            />
            <div 
              className="h-8 w-8 rounded-full bg-[#ae0f0a] text-white flex items-center justify-center cursor-pointer hover:bg-[#8e0c08] transition-colors flex-shrink-0 accessibility-focus"
              onClick={handleUserMenuClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleUserMenuClick();
                }
              }}
              tabIndex={0}
              role="button"
              aria-haspopup="true"
              aria-expanded={showUserMenu}
              aria-label={`Menu do usuário ${user?.nome}`}
            >
              {user?.nome?.charAt(0).toUpperCase()}
            </div>

            {/* Menu flutuante do usuário */}
            {showUserMenu && (
              <div 
                ref={userMenuRef}
                className="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu"
              >
                {/* Mostrar o nome do usuário apenas no menu em mobile */}
                {isMobile && (
                  <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                    {user?.nome}
                  </div>
                )}
                <button
                  onClick={() => handleMenuItemClick('accessibility')}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left accessibility-focus"
                  role="menuitem"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Acessibilidade
                </button>
                <button
                  onClick={() => handleMenuItemClick('profile')}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left accessibility-focus"
                  role="menuitem"
                >
                  <User className="h-4 w-4 mr-2" />
                  Alterar Dados
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => handleMenuItemClick('logout')}
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left accessibility-focus"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal de Acessibilidade */}
      <Modal
        isOpen={isAccessibilityModalOpen}
        onClose={() => {
          setIsAccessibilityModalOpen(false);
          setShowShortcuts(false);
          announceToScreenReader("Configurações de acessibilidade fechadas");
        }}
        title="Acessibilidade"
        className="max-w-[95%] md:max-w-lg mx-auto"
        sidePanel={
          <div
            className={`w-72 bg-white dark:bg-[#1c2130] border border-gray-200 dark:border-[#30363d] rounded-2xl shadow-2xl transition-all duration-300 ${
              showShortcuts ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#30363d]">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Atalhos de Teclado</span>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Fechar painel de atalhos"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <AccessibilityHelp />
            </div>
          </div>
        }
      >
        <div className="relative">
        {/* Botão ? no canto superior direito do conteúdo */}
        <button
          onClick={() => setShowShortcuts(v => !v)}
          className={`absolute top-0 right-0 flex items-center justify-center w-7 h-7 rounded-full border transition-colors z-10 ${
            showShortcuts
              ? 'border-[#ae0f0a] text-[#ae0f0a]'
              : 'border-gray-300 dark:border-[#30363d] text-gray-400 hover:text-[#ae0f0a] hover:border-[#ae0f0a]'
          }`}
          aria-label="Ver atalhos de teclado"
          aria-pressed={showShortcuts}
          title="Atalhos de teclado"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
        <div className="space-y-5">

          {/* ── Tamanho da Fonte ───────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Type className="h-4 w-4 text-[#ae0f0a] flex-shrink-0" />
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tamanho da Fonte</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              {/* Preview ao vivo */}
              <div className="flex items-center justify-between mb-3">
                <span
                  style={{ fontSize: accessibilitySettings.fontSize }}
                  className="font-semibold text-gray-800 transition-all duration-200 leading-none"
                >
                  Aa
                </span>
                <span className="text-xs text-gray-500 bg-white dark:bg-[#21262d] border border-gray-200 dark:border-[#30363d] px-2.5 py-1 rounded-full">
                  {accessibilitySettings.fontSize}px
                </span>
              </div>
              {/* Controles */}
              <div className="flex items-stretch gap-2">
                <button
                  onClick={() => handleAccessibilityAction(decreaseFontSize, `Fonte diminuída`)}
                  disabled={accessibilitySettings.fontSize <= 12}
                  className="flex flex-1 items-center justify-center gap-1.5 py-2 bg-white dark:bg-[#21262d] border border-gray-200 dark:border-[#30363d] hover:bg-gray-100 dark:hover:bg-[#262d3a] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors accessibility-focus"
                  aria-label="Diminuir fonte"
                >
                  <Minus className="h-3.5 w-3.5" />
                  <span>A−</span>
                </button>
                <button
                  onClick={() => handleAccessibilityAction(resetFontSize, "Fonte padrão restaurada")}
                  className="flex flex-1 items-center justify-center py-2 bg-white dark:bg-[#21262d] border border-gray-200 dark:border-[#30363d] hover:bg-gray-100 dark:hover:bg-[#262d3a] rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors accessibility-focus"
                  aria-label="Restaurar fonte padrão"
                >
                  Padrão
                </button>
                <button
                  onClick={() => handleAccessibilityAction(increaseFontSize, `Fonte aumentada`)}
                  disabled={accessibilitySettings.fontSize >= 24}
                  className="flex flex-1 items-center justify-center gap-1.5 py-2 bg-white dark:bg-[#21262d] border border-gray-200 dark:border-[#30363d] hover:bg-gray-100 dark:hover:bg-[#262d3a] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors accessibility-focus"
                  aria-label="Aumentar fonte"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>A+</span>
                </button>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* ── Aparência ─────────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-4 w-4 text-[#ae0f0a] flex-shrink-0" />
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Aparência</h3>
            </div>

            {/* Seletor de tema */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {([
                { key: 'light',  label: 'Claro',   Icon: Sun },
                { key: 'dark',   label: 'Escuro',  Icon: Moon },
                { key: 'system', label: 'Sistema', Icon: Monitor },
              ] as const).map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => handleThemeChange(key)}
                  className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all ${
                    accessibilitySettings.theme === key
                      ? 'border-[#ae0f0a] bg-[#ae0f0a]/10 text-[#ae0f0a]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                  aria-pressed={accessibilitySettings.theme === key}
                  aria-label={`Selecionar ${ key === 'light' ? 'tema claro' : key === 'dark' ? 'tema escuro' : 'tema do sistema' }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              ))}
            </div>

            {/* Alto Contraste */}
            <button
              onClick={() => handleAccessibilityAction(
                toggleHighContrast,
                accessibilitySettings.highContrast ? "Alto contraste desativado" : "Alto contraste ativado"
              )}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                accessibilitySettings.highContrast
                  ? 'border-[#ae0f0a] bg-[#ae0f0a]/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              aria-pressed={accessibilitySettings.highContrast}
              aria-label="Alternar alto contraste"
            >
              <div className="flex items-center gap-3">
                <Contrast className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Alto Contraste</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Aumenta o contraste de cores</div>
                </div>
              </div>
              <Toggle active={accessibilitySettings.highContrast} />
            </button>
          </section>

          <hr className="border-gray-100" />

          {/* ── Movimento e Som ───────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-[#ae0f0a] flex-shrink-0" />
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Movimento e Som</h3>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleAccessibilityAction(
                  toggleReduceMotion,
                  accessibilitySettings.reduceMotion ? "Animações reativadas" : "Animações reduzidas"
                )}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                  accessibilitySettings.reduceMotion
                    ? 'border-[#ae0f0a] bg-[#ae0f0a]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                aria-pressed={accessibilitySettings.reduceMotion}
                aria-label="Alternar redução de movimento"
              >
                <div className="flex items-center gap-3">
                  {accessibilitySettings.reduceMotion
                    ? <ZapOff className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    : <Zap className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  }
                  <div className="text-left">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Reduzir Animações</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Minimiza efeitos de transição</div>
                  </div>
                </div>
                <Toggle active={accessibilitySettings.reduceMotion} />
              </button>

              <button
                onClick={() => handleAccessibilityAction(
                  toggleSound,
                  accessibilitySettings.soundEnabled ? "Sons desativados" : "Sons ativados"
                )}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                  accessibilitySettings.soundEnabled
                    ? 'border-[#ae0f0a] bg-[#ae0f0a]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                aria-pressed={accessibilitySettings.soundEnabled}
                aria-label="Alternar sons do sistema"
              >
                <div className="flex items-center gap-3">
                  {accessibilitySettings.soundEnabled
                    ? <Volume2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    : <VolumeX className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  }
                  <div className="text-left">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Sons do Sistema</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Feedbacks sonoros de interação</div>
                  </div>
                </div>
                <Toggle active={accessibilitySettings.soundEnabled} />
              </button>
            </div>
          </section>

          {/* ── Rodapé ────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-[#30363d]">
            <Button
              type="button"
              onClick={() => handleAccessibilityAction(resetAllSettings, "Configurações restauradas para o padrão")}
              className="flex-1 h-11 px-4 bg-gray-100 dark:bg-[#21262d] hover:bg-gray-200 dark:hover:bg-[#30363d] rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 accessibility-focus"
            >
              Restaurar Padrão
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsAccessibilityModalOpen(false);
                playSound('success');
                announceToScreenReader("Configurações salvas");
              }}
              className="flex-1 h-11 px-4 bg-[#ae0f0a] hover:bg-[#8e0c08] rounded-xl text-sm font-medium text-white transition-colors duration-200 accessibility-focus"
            >
              Salvar e Fechar
            </Button>
          </div>
        </div>
        </div>
      </Modal>

      {/* Modal de Alteração de Dados */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Alteração de Dados"
        className="max-w-[90%] md:max-w-md mx-auto"
      >
        <div className="space-y-4">
          <div className="flex flex-col items-center text-center space-y-4">
            <Info className="w-16 h-16 text-[#ae0f0a]" />
            <p className="text-lg font-['Source_Sans_3',Helvetica] text-gray-700">
              A funcionalidade de alteração de dados pessoais será implementada em uma versão futura!
            </p>
            <Button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="h-[57px] px-6 bg-[#ae0f0a] hover:bg-[#8e0c08] rounded-lg font-['Source_Sans_3',Helvetica] font-bold text-white text-lg transition-colors duration-200 accessibility-focus"
            >
              Entendi
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
