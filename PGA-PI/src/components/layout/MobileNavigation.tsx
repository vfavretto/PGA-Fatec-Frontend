import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  ClipboardList, 
  PlusCircle, 
  Settings, 
  LayoutList,
  X,
  Menu
} from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';
import { useAuth } from '@/hooks/useAuth';
import { BASE_ROUTE } from '@lib/config';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const location = useLocation();
  const { isMobile } = useMobile();
  const { user } = useAuth();

  const isRegional = user?.tipo_usuario === 'Regional';
  const isAdminOrCps = user?.tipo_usuario === 'Administrador' || user?.tipo_usuario === 'CPS';
  const isDiretor = user?.tipo_usuario === 'Diretor';
  const canCreateProject =
    user?.tipo_usuario === 'Coordenador' || user?.tipo_usuario === 'Diretor';
  const canAccessSettings =
    user?.tipo_usuario !== 'Docente' && user?.tipo_usuario !== 'Administrativo';

  const navItems = [
    {
      label: "Visão Geral",
      path: `${BASE_ROUTE}dashboard`,
      icon: Home,
    },
    ...(isAdminOrCps || isDiretor || isRegional
      ? [{ label: "PGAs", path: `${BASE_ROUTE}pgas`, icon: LayoutList }]
      : []),
    { label: "Projetos", path: `${BASE_ROUTE}projects/list`, icon: ClipboardList },
    ...(canCreateProject
      ? [
          { label: "Criar Formulário", path: `${BASE_ROUTE}projects`, icon: PlusCircle },
        ]
      : []),
    ...(canAccessSettings
      ? [{
          label: "Configurações",
          path: `${BASE_ROUTE}settings`,
          icon: Settings,
        }]
      : []),
  ];

  const handleNavigation = (path: string) => {
    onClose();
  };

  if (!isMobile) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Menu lateral mobile */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header do menu */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors mobile-touch-target"
            aria-label="Fechar menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Lista de navegação */}
        <nav className="flex-1 p-6">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-colors mobile-touch-target ${
                      isActive
                        ? 'bg-[#ae0f0a] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer do menu */}
        <div className="p-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-500">PGA</p>
            <p className="text-xs text-gray-400">Fatec Votorantim</p>
          </div>
        </div>
      </div>
    </>
  );
};

// Componente de botão flutuante para mobile
export const MobileFloatingButton: React.FC<{ onClick: () => void }> = ({ 
  onClick 
}) => {
  const { isMobile } = useMobile();

  if (!isMobile) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-[#ae0f0a] text-white rounded-full shadow-lg hover:bg-[#8e0c08] transition-colors z-40 mobile-touch-target touch-feedback"
      aria-label="Abrir menu de navegação"
    >
      <Menu className="h-6 w-6 mx-auto" />
    </button>
  );
};
