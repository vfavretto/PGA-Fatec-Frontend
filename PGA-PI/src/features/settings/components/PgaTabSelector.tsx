import { TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Users, Target, List, BarChart3, FileText, AlertCircle, Clock, ShieldCheck, Building2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRef } from "react";

interface PgaTabSelectorProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const ALL_TABS = [
  { id: "pessoas", label: "Pessoas", icon: Users, roles: null },
  { id: "unidades", label: "Unidades", icon: Building2, roles: ["Administrador", "CPS"] },
  { id: "eixos", label: "Eixos Temáticos", icon: Target, roles: ["Administrador", "CPS"] },
  { id: "temas", label: "Temas", icon: List, roles: ["Administrador", "CPS"] },
  { id: "prioridades", label: "Prioridades", icon: BarChart3, roles: ["Administrador", "CPS"] },
  { id: "entregaveis", label: "Entregáveis", icon: FileText, roles: ["Administrador", "CPS"] },
  { id: "situacoes", label: "Situações", icon: AlertCircle, roles: ["Administrador", "CPS"] },
  { id: "cargahoraria", label: "Carga Horária", icon: Clock, roles: ["Administrador", "CPS"] },
  { id: "auditoria", label: "Auditoria", icon: ShieldCheck, roles: null },
];

export const PgaTabSelector = ({ activeTab, onTabChange }: PgaTabSelectorProps) => {
  const { user } = useAuth();
  const tipoUsuario = user?.tipo_usuario ?? "";

  const tabs = ALL_TABS.filter(tab =>
    tab.roles === null || tab.roles.includes(tipoUsuario)
  );

  const minWidth = tabs.length * 90 + (tabs.length - 1) * 6;

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    scrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
    if (scrollRef.current) scrollRef.current.style.cursor = "grabbing";
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX.current;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const onMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  };

  return (
    <div
      ref={scrollRef}
      className="mb-6 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden select-none"
      style={{ cursor: "grab" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <TabsList
        className="flex gap-1.5 bg-transparent h-auto p-0 w-full"
        style={{ minWidth }}
      >
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={[
              "flex-1 flex flex-col items-center justify-center gap-1",
              "h-[52px] px-2 border rounded-md transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ae0f0a]/20",
              activeTab === tab.id
                ? "bg-[#ae0f0a]/10 border-[#ae0f0a] text-[#ae0f0a] shadow-sm"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800",
            ].join(" ")}
          >
            <tab.icon className="h-[15px] w-[15px] flex-shrink-0" />
            <span className="text-[10px] leading-tight text-center font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-full px-1">
              {tab.label}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};