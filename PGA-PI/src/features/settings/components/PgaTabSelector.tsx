import { TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Users, Target, List, BarChart3, FileText, AlertCircle, Clock, ShieldCheck } from "lucide-react";

interface PgaTabSelectorProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  allowedTabs?: string[];
}

export const PgaTabSelector = ({ activeTab, onTabChange, allowedTabs }: PgaTabSelectorProps) => {
  const allTabs = [
    { id: "pessoas", label: "Pessoas", icon: Users },
    { id: "eixos", label: "Eixos Temáticos", icon: Target },
    { id: "temas", label: "Temas", icon: List },
    { id: "prioridades", label: "Prioridades", icon: BarChart3 },
    { id: "entregaveis", label: "Entregáveis", icon: FileText },
    { id: "situacoes", label: "Situações", icon: AlertCircle },
    { id: "cargahoraria", label: "Carga Horária", icon: Clock },
    { id: "auditoria", label: "Auditoria", icon: ShieldCheck },
  ];

  const tabs = allowedTabs
    ? allTabs.filter((t) => allowedTabs.includes(t.id))
    : allTabs;

  return (
    <TabsList className="mb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 bg-transparent w-full">
      {tabs.map(tab => (
        <TabsTrigger 
          key={tab.id}
          value={tab.id} 
          onClick={() => onTabChange(tab.id)}
          className={`
            flex items-center justify-center py-2 sm:py-3 px-2 border rounded-md 
            transition-all duration-200 text-xs sm:text-sm font-medium 
            min-h-[50px] sm:min-h-[60px] md:min-h-[65px]
            hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ae0f0a]/20
            ${activeTab === tab.id 
              ? "bg-[#ae0f0a]/10 border-[#ae0f0a] text-[#ae0f0a] shadow-sm" 
              : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            }
          `}
        >
          <div className="flex flex-col items-center gap-1 sm:gap-1.5">
            <tab.icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="text-[10px] sm:text-xs leading-tight text-center font-medium px-1 break-words">
              {tab.label}
            </span>
          </div>
        </TabsTrigger>
      ))}
    </TabsList>
  );
};