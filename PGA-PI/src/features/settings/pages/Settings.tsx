import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent } from "../../../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Toaster } from "../../../components/ui/toaster";
import { Button } from "../../../components/ui/button";
import { PessoasConfig } from "../components/PessoasConfig";
import { EixosConfig } from "../components/EixosConfig";
import { TemasConfig } from "../components/TemasConfig";
import { PrioridadesConfig } from "../components/PrioridadesConfig";
import { EntregaveisConfig } from "../components/EntregaveisConfig";
import { SituacoesConfig } from "../components/SituacoesConfig";
import { CargaHorariaConfig } from "../components/CargaHorariaConfig";
import { UnidadesConfig } from "../components/UnidadesConfig";
import { PgaTabSelector } from "../components/PgaTabSelector";
import { Cog, Settings as SettingsIcon, Calendar, History } from "lucide-react";
import { AuditHistoryConfig } from '../components/AuditHistoryConfig';
import { PGAHistoryViewer } from '../../dashboard/components/PGAHistoryViewer';
import { useAuth } from "@/context/AuthContext";
import { BASE_ROUTE } from "@/lib/config";

const ADMIN_ONLY_TABS = ["eixos", "temas", "prioridades", "entregaveis", "situacoes", "cargahoraria"];
const ADMIN_ROLES = ["Administrador", "CPS"];

export const Settings = (): JSX.Element => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const tipoUsuario = user?.tipo_usuario ?? "";
  const isAdminRole = ADMIN_ROLES.includes(tipoUsuario);

  // Redireciona Docente e Administrativo — sem acesso a Configurações
  useEffect(() => {
    if (user && (tipoUsuario === 'Docente' || tipoUsuario === 'Administrativo')) {
      navigate(`${BASE_ROUTE}dashboard`, { replace: true });
    }
  }, [user, tipoUsuario, navigate]);

  const [activeTab, setActiveTab] = useState("pessoas");
  const [viewingHistory, setViewingHistory] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Se a aba ativa for restrita e o usuário não tem permissão, volta para "pessoas"
  useEffect(() => {
    if (!isAdminRole && ADMIN_ONLY_TABS.includes(activeTab)) {
      setActiveTab("pessoas");
    }
  }, [activeTab, isAdminRole]);

  // Anos disponíveis
  const availableYears = Array.from(
    { length: 5 }, 
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
      {/* Header responsivo */}
      <div className="mb-6 sm:mb-8 lg:mb-10">
        <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center">
            <SettingsIcon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mr-2 sm:mr-3 text-[#ae0f0a]" />
            <h1 className="font-extrabold text-black text-xl sm:text-2xl md:text-3xl lg:text-[32px]">
              Configurações do PGA
            </h1>
          </div>

          <p className="text-gray-600 text-sm sm:text-base max-w-xs sm:max-w-md md:max-w-2xl mx-auto leading-relaxed">
            {viewingHistory 
              ? `Visualizando configurações históricas de ${selectedYear} - Estado das configurações conforme registrado neste ano`
              : "Gerencie os dados básicos utilizados no sistema do Plano de Gestão Anual. Estas configurações serão utilizadas em todo o sistema."
            }
          </p>
        </div>
      </div>

      {/* Card principal com controles responsivos no header */}
      <Card className="w-full shadow-[0px_0px_25px_#00000026] rounded-xl border-t-4 border-t-[#ae0f0a]">
        <CardHeader className="bg-white-100 rounded-t-xl py-4 sm:py-[15px] px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Lado esquerdo - Título e descrição */}
            <div className="flex items-start space-x-3">
              <Cog className="h-5 w-5 sm:h-6 sm:w-6 mt-1 text-[#ae0f0a] flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <CardTitle className="font-normal text-black text-lg sm:text-xl md:text-2xl lg:text-[28px] leading-tight">
                  {viewingHistory ? `Configurações Históricas ${selectedYear}` : 'Gerenciar Configurações do Sistema'}
                </CardTitle>
                <CardDescription className="mt-1 sm:mt-2 text-sm sm:text-base leading-relaxed">
                  {viewingHistory 
                    ? 'Navegue pelas seções para ver como as configurações estavam organizadas neste período'
                    : 'Utilize as abas abaixo para configurar os diferentes aspectos do sistema'
                  }
                </CardDescription>
              </div>
            </div>

            {/* Lado direito - Controles de histórico responsivos */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 bg-white text-xs sm:text-sm min-w-[80px] sm:min-w-[100px] flex-1 sm:flex-none"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <Button
                variant={viewingHistory ? "default" : "outline"}
                size="sm"
                onClick={() => setViewingHistory(!viewingHistory)}
                className={`w-full sm:w-auto text-xs sm:text-sm ${viewingHistory ? "bg-[#ae0f0a] hover:bg-[#8d0c08]" : ""}`}
              >
                <History className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{viewingHistory ? 'Ver Atual' : 'Ver Histórico'}</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6 lg:p-8">
          {/* Conteúdo condicional */}
          {viewingHistory ? (
            <div className="space-y-4">
              <PGAHistoryViewer 
                pgaId={0} 
                ano={selectedYear} 
                key={`history-${selectedYear}`} // 🔥 FORÇA RE-RENDER
              />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <PgaTabSelector activeTab={activeTab} onTabChange={setActiveTab} />
              
              <div className="space-y-0">
                <TabsContent value="pessoas" isActive={activeTab === "pessoas"}>
                  <PessoasConfig />
                </TabsContent>

                <TabsContent value="unidades" isActive={activeTab === "unidades"}>
                  {isAdminRole && <UnidadesConfig />}
                </TabsContent>
                
                <TabsContent value="eixos" isActive={activeTab === "eixos"}>
                  <EixosConfig />
                </TabsContent>
                
                <TabsContent value="temas" isActive={activeTab === "temas"}>
                  <TemasConfig />
                </TabsContent>
                
                <TabsContent value="prioridades" isActive={activeTab === "prioridades"}>
                  <PrioridadesConfig />
                </TabsContent>
                
                <TabsContent value="entregaveis" isActive={activeTab === "entregaveis"}>
                  <EntregaveisConfig />
                </TabsContent>
                
                <TabsContent value="situacoes" isActive={activeTab === "situacoes"}>
                  <SituacoesConfig />
                </TabsContent>
                
                <TabsContent value="cargahoraria" isActive={activeTab === "cargahoraria"}>
                  <CargaHorariaConfig />
                </TabsContent>

                <TabsContent value="auditoria" isActive={activeTab === "auditoria"}>
                  <AuditHistoryConfig selectedYear={selectedYear} />
                </TabsContent>
              </div>
            </Tabs>
          )}
        </CardContent>
      </Card>
      
      <Toaster />
    </div>
  );
};
