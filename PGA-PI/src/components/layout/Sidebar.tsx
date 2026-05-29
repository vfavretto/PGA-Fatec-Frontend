import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoImage, logoMini } from "@/assets";
import { useAuth } from "../../hooks/useAuth";
import { 
  Home, 
  ClipboardList, 
  PlusCircle, 
  Settings, 
  LogOut,
  FileText,
  LayoutList,
} from "lucide-react";
import { Tooltip } from "../ui/tooltip";
import { BASE_ROUTE } from "@lib/config";

interface SidebarProps {
  isExpanded: boolean;
  toggleSidebar: () => void;
}

export const Sidebar = ({ isExpanded, toggleSidebar }: SidebarProps): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isAdminOrCps =
    user?.tipo_usuario === 'Administrador' || user?.tipo_usuario === 'CPS';
  const isDiretor = user?.tipo_usuario === 'Diretor';
  const isRegional = user?.tipo_usuario === 'Regional';
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
    // PGAs — visível para Admin/CPS, Diretor e Regional
    ...(isAdminOrCps || isDiretor || isRegional
      ? [
          {
            label: "PGAs",
            path: `${BASE_ROUTE}pgas`,
            icon: LayoutList,
          },
        ]
      : []),
    // Projetos — visível para todos (Regional só visualiza, sem criar)
    {
      label: "Projetos",
      path: `${BASE_ROUTE}projects/list`,
      icon: ClipboardList,
    },
    // Criar Formulário — somente Coordenador e Diretor
    ...(canCreateProject
      ? [
          {
            label: "Criar Formulário",
            path: `${BASE_ROUTE}projects`,
            icon: PlusCircle,
          },
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

  // Previne o comportamento padrão e navega programaticamente
  const handleNavigation = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    navigate(path);
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  // Renderiza os subitens quando o item pai está expandido
  const renderSubItems = (item: any) => {
    if (!isExpanded || !item.subItems) return null;

    return (
      <div className="pl-8 mt-1 space-y-1">
        {item.subItems.map((subItem: any) => (
          <button
            key={subItem.path}
            onClick={(e) => handleNavigation(e, subItem.path)}
            className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors
              ${location.pathname === subItem.path
                ? "bg-[#ae0f0a]/10 text-[#ae0f0a]"
                : "text-gray-600 hover:bg-gray-50"
              }
            `}
          >
            {subItem.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300 will-change-transform z-50
          ${isExpanded ? "w-64" : "w-24"}
          ${!isExpanded ? "-translate-x-full md:translate-x-0" : "translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo e cabeçalho */}
          <div className="p-6">
            <div className="flex items-center justify-center mb-8">
              <img 
                src={isExpanded ? logoImage : logoMini}
                alt="Fatec Votorantim" 
                className="transition-opacity duration-300"
                style={{ 
                  width: isExpanded ? '160px' : '64px',
                  maxHeight: '80px',
                  objectFit: 'contain'
                }}
              />
            </div>
            
            {isExpanded && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-700">PGA</h3>
                  <p className="text-sm text-gray-500">Bem-vindo, {user?.nome}</p>
                </div>
              </div>
            )}
          </div>

          {/* Menu de navegação com tooltips */}
          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <div key={item.path}>
                <Tooltip 
                  content={item.label}
                  show={!isExpanded}
                >
                  <button
                    onClick={(e) => handleNavigation(e, item.path)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors
                      ${location.pathname === item.path
                        ? "bg-[#ae0f0a] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                      }
                      ${!isExpanded && "justify-center"}
                    `}
                  >
                    <item.icon className={`${isExpanded ? "mr-3" : ""} h-6 w-6`} />
                    {isExpanded && <span>{item.label}</span>}
                  </button>
                </Tooltip>
                {renderSubItems(item)}
              </div>
            ))}
          </nav>

          {/* Footer com tooltip no botão de sair */}
          <div className="p-4 border-t border-gray-200">
            <Tooltip 
              content="Sair"
              show={!isExpanded}
            >
              <button
                onClick={logout}
                className={`flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors
                  ${!isExpanded && "justify-center"}
                `}
              >
                <LogOut className={`${isExpanded ? "mr-3" : ""} h-6 w-6`} /> {/* Aumentado de h-5 w-5 para h-6 w-6 */}
                {isExpanded && <span>Sair</span>}
              </button>
            </Tooltip>
          </div>
        </div>
      </aside>
    </>
  );
};