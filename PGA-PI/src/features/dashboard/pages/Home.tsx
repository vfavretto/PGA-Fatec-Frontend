import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../components/cardDashboard";
import { StatsCard } from "../components/StatsCard";
import { ProjectProgressCard } from "../components/ProjectProgressCard";
import { EmployeeChart } from "../components/EmployeeChart";
import { UpcomingDeadlines } from "../components/UpcomingDeadlines";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  Users,
  Briefcase,
  Clock,
  TrendingUp,
  Building2,
  Calendar,
  BarChart3,
  Target,
  AlertCircle,
  Send,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react";
import { projectService } from "@/features/projects/services/projectService";
import api from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/config";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { pgaService } from "@/services/pgaService";
import { AcaoProjeto, PgaComUnidade, StatusPGA } from "@/types/api";
import {
  buildEmployees,
  buildProjectCards,
  buildDeadlines,
} from "../utils/transformers";
import { RegionalDashboard } from "./RegionalDashboard";

export const Home = (): JSX.Element => {
  const { user } = useAuth();
  const { isRegionalOnly, canSubmitPga } = usePermissions();
  const [activeTab, setActiveTab] = useState("overview");

  const [projetos, setProjetos] = useState<AcaoProjeto[]>([]);
  const [pgaAtual, setPgaAtual] = useState<PgaComUnidade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingPga, setSubmittingPga] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [projetosData, pgasData]: [AcaoProjeto[], PgaComUnidade[]] =
          await Promise.all([
            projectService.getAll(),
            api.get(API_ENDPOINTS.PGA).then((r) => r.data),
          ]);

        // Identificar o PGA da unidade do usuário logado
        const unidadeId: number | undefined =
          (user as any)?.unidades?.[0]?.unidade_id ?? undefined;

        let pga: PgaComUnidade | null = null;
        if (unidadeId) {
          const pgasDaUnidade = pgasData.filter(
            (p) => p.unidade_id === unidadeId
          );
          pga =
            pgasDaUnidade.sort((a, b) => b.ano - a.ano)[0] ??
            pgasData[0] ??
            null;
        } else {
          pga = pgasData.sort((a, b) => b.ano - a.ano)[0] ?? null;
        }

        setPgaAtual(pga);

        // Filtrar projetos pelo PGA identificado
        const projetosFiltrados = pga
          ? projetosData.filter((p) => p.pga_id === pga!.pga_id)
          : projetosData;

        setProjetos(projetosFiltrados);
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
        setError("Erro ao carregar dados do dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (isRegionalOnly) {
      setLoading(false);
      return;
    }

    loadData();
  }, [user, isRegionalOnly]);

  if (isRegionalOnly) {
    return <RegionalDashboard />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  const employees = buildEmployees(projetos);
  const projectCards = buildProjectCards(projetos);
  const deadlines = buildDeadlines(projetos);

  const totalHoras = employees.reduce((acc, emp) => acc + emp.hoursAllocated, 0);
  const progressoMedio =
    projectCards.length > 0
      ? Math.round(
          projectCards.reduce((acc, p) => acc + p.progress, 0) /
            projectCards.length
        )
      : 0;

  const anoAtual = pgaAtual?.ano ?? new Date().getFullYear();
  const codigoUnidade = pgaAtual?.unidade?.codigo_fnnn ?? "—";
  const nomeUnidade = pgaAtual?.unidade?.nome_completo ?? "—";
  const diretorNome = pgaAtual?.unidade?.diretor_nome ?? "—";

  const statusAtual = (pgaAtual?.status as StatusPGA) ?? null;
  const statusLabel: Record<string, string> = {
    [StatusPGA.EmElaboracao]: "Em elaboração",
    [StatusPGA.Submetido]: "Aguardando análise regional",
    [StatusPGA.Aprovado]: "Aprovado",
    [StatusPGA.Reprovado]: "Reprovado",
  };
  const statusBadgeClass: Record<string, string> = {
    [StatusPGA.EmElaboracao]: "bg-gray-100 text-gray-700 border-gray-300",
    [StatusPGA.Submetido]: "bg-yellow-100 text-yellow-800 border-yellow-300",
    [StatusPGA.Aprovado]: "bg-green-100 text-green-800 border-green-300",
    [StatusPGA.Reprovado]: "bg-red-100 text-red-800 border-red-300",
  };
  const statusIcon: Record<string, JSX.Element> = {
    [StatusPGA.EmElaboracao]: <Clock className="h-4 w-4" />,
    [StatusPGA.Submetido]: <Send className="h-4 w-4" />,
    [StatusPGA.Aprovado]: <CheckCircle2 className="h-4 w-4" />,
    [StatusPGA.Reprovado]: <XCircle className="h-4 w-4" />,
  };

  const handleSubmitPga = async () => {
    if (!pgaAtual) return;
    const confirmar = window.confirm(
      `Enviar o PGA ${pgaAtual.ano} para análise regional?`,
    );
    if (!confirmar) return;

    try {
      setSubmittingPga(true);
      const atualizado = await pgaService.submit(pgaAtual.pga_id);
      setPgaAtual((prev) =>
        prev
          ? {
              ...prev,
              status: atualizado.status,
              parecer_regional: atualizado.parecer_regional ?? prev.parecer_regional,
              data_parecer_regional:
                atualizado.data_parecer_regional ?? prev.data_parecer_regional,
            }
          : prev,
      );
      toast({
        title: "PGA enviado",
        description: "O PGA foi enviado para análise regional.",
      });
    } catch (err: any) {
      console.error("Erro ao submeter PGA:", err);
      toast({
        variant: "destructive",
        title: "Erro ao enviar PGA",
        description:
          err?.response?.data?.message ??
          "Não foi possível enviar o PGA para análise agora.",
      });
    } finally {
      setSubmittingPga(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-extrabold text-black text-2xl md:text-[32px] text-center">
        Dashboard PGA {anoAtual}
      </h1>

      {/* Card da Instituição */}
      <Card className="w-full shadow-[0px_0px_25px_#00000026] rounded-xl mb-6 md:mb-[30px] bg-gradient-to-r from-[#ae0f0a] to-[#8e0c08] text-white">
        <CardHeader className="bg-white/10 backdrop-blur-sm rounded-t-xl py-4 md:py-6 px-6 md:px-8">
          <div className="flex items-center gap-4">
            <Building2 className="w-8 h-8 text-white" />
            <h2 className="font-semibold text-white text-xl md:text-[28px]">
              IDENTIFICAÇÃO DA UNIDADE
            </h2>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center md:text-left">
              <p className="font-medium text-white/80 text-base md:text-lg mb-2">
                Código da Unidade
              </p>
              <p className="font-bold text-white text-2xl md:text-3xl">{codigoUnidade}</p>
            </div>
            <div className="text-center md:text-left">
              <p className="font-medium text-white/80 text-base md:text-lg mb-2">
                Unidade
              </p>
              <p className="font-bold text-white text-2xl md:text-3xl">
                {nomeUnidade}
              </p>
            </div>
            <div className="text-center md:text-left">
              <p className="font-medium text-white/80 text-base md:text-lg mb-2">
                Diretor(a)
              </p>
              <p className="font-bold text-white text-2xl md:text-3xl">
                {diretorNome}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Status do PGA */}
      {pgaAtual && (
        <Card className="w-full shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 mt-1 text-[#ae0f0a]" />
                <div>
                  <p className="text-sm text-gray-500">Status do PGA {pgaAtual.ano}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className={`${
                        statusBadgeClass[statusAtual ?? ""] ??
                        "bg-gray-100 text-gray-700 border-gray-300"
                      } font-semibold flex items-center gap-1`}
                    >
                      {statusIcon[statusAtual ?? ""]}
                      {statusLabel[statusAtual ?? ""] ?? statusAtual ?? "—"}
                    </Badge>
                    {pgaAtual.data_parecer_regional && (
                      <span className="text-xs text-gray-500">
                        Parecer em{" "}
                        {new Date(pgaAtual.data_parecer_regional).toLocaleDateString(
                          "pt-BR",
                        )}
                      </span>
                    )}
                  </div>

                  {statusAtual === StatusPGA.Reprovado && pgaAtual.parecer_regional && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md max-w-2xl">
                      <p className="text-xs font-medium text-red-800 mb-1">
                        Parecer regional
                      </p>
                      <p className="text-sm text-red-900 whitespace-pre-line">
                        {pgaAtual.parecer_regional}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {canSubmitPga &&
                (statusAtual === StatusPGA.EmElaboracao ||
                  statusAtual === StatusPGA.Reprovado) && (
                  <Button
                    onClick={handleSubmitPga}
                    disabled={submittingPga}
                    className="bg-[#ae0f0a] hover:bg-[#8e0c08] text-white flex items-center gap-2"
                  >
                    {submittingPga ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {statusAtual === StatusPGA.Reprovado
                          ? "Reenviar para análise"
                          : "Enviar para análise"}
                      </>
                    )}
                  </Button>
                )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sistema de Abas */}
      <Tabs className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 mb-6 mobile-tabs">
          <TabsTrigger
            value="overview"
            isActive={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger
            value="projects"
            isActive={activeTab === "projects"}
            onClick={() => setActiveTab("projects")}
            className="flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Projetos</span>
          </TabsTrigger>
          <TabsTrigger
            value="team"
            isActive={activeTab === "team"}
            onClick={() => setActiveTab("team")}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Equipe</span>
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            isActive={activeTab === "schedule"}
            onClick={() => setActiveTab("schedule")}
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Cronograma</span>
          </TabsTrigger>
        </TabsList>

        {/* Aba Visão Geral */}
        <TabsContent value="overview" isActive={activeTab === "overview"}>
          <div className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mobile-container">
              <StatsCard
                title="Total de Projetos"
                value={projetos.length}
                description="Projetos ativos no PGA"
                icon={<Briefcase className="w-5 h-5" />}
              />
              <StatsCard
                title="Funcionários Alocados"
                value={employees.length}
                description="Membros da equipe"
                icon={<Users className="w-5 h-5" />}
              />
              <StatsCard
                title="Horas Totais"
                value={totalHoras}
                description="Horas alocadas"
                icon={<Clock className="w-5 h-5" />}
              />
              <StatsCard
                title="Progresso Médio"
                value={`${progressoMedio}%`}
                description="Dos projetos"
                icon={<TrendingUp className="w-5 h-5" />}
              />
            </div>

            {/* Resumo dos Projetos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mobile-stack">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Projetos em Destaque
                </h3>
                {projectCards.slice(0, 2).map((project) => (
                  <ProjectProgressCard key={project.id} project={project} />
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Próximas Datas
                </h3>
                <UpcomingDeadlines deadlines={deadlines.slice(0, 3)} />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Aba Projetos */}
        <TabsContent value="projects" isActive={activeTab === "projects"}>
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Andamento dos Projetos
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mobile-stack">
              {projectCards.map((project) => (
                <ProjectProgressCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Aba Equipe */}
        <TabsContent value="team" isActive={activeTab === "team"}>
          <div className="space-y-6">
            <EmployeeChart employees={employees} />
          </div>
        </TabsContent>

        {/* Aba Cronograma */}
        <TabsContent value="schedule" isActive={activeTab === "schedule"}>
          <div className="space-y-6">
            <UpcomingDeadlines deadlines={deadlines} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
