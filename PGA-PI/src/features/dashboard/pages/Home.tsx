import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HomeRegional } from "./HomeRegional";
import { Card, CardContent, CardHeader } from "../components/cardDashboard";
import { StatsCard } from "../components/StatsCard";
import { ProjectProgressCard } from "../components/ProjectProgressCard";
import { EmployeeChart } from "../components/EmployeeChart";
import { UpcomingDeadlines } from "../components/UpcomingDeadlines";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs";
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
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { projectService } from "@/features/projects/services/projectService";
import api from "@/lib/api";
import { API_ENDPOINTS, BASE_ROUTE } from "@/lib/config";
import { useAuth } from "@/context/AuthContext";
import { AcaoProjeto, PgaComUnidade, StatusPGA } from "@/types/api";
import {
  buildEmployees,
  buildProjectCards,
  buildDeadlines,
} from "../utils/transformers";

const STATUS_LABEL: Record<StatusPGA, string> = {
  EmElaboracao: 'Em Elaboração',
  Publicado: 'Publicado',
  Submetido: 'Submetido — aguardando avaliação regional',
  Aprovado: 'Aprovado pela Regional',
  AguardandoCPS: 'Aguardando CPS',
  AprovadoCPS: 'Aprovado pelo CPS',
  Reprovado: 'Reprovado — necessita correções',
};

const STATUS_CLASS: Record<StatusPGA, string> = {
  EmElaboracao: 'bg-yellow-100 text-yellow-800',
  Publicado: 'bg-blue-100 text-blue-800',
  Submetido: 'bg-purple-100 text-purple-800',
  Aprovado: 'bg-green-100 text-green-800',
  AguardandoCPS: 'bg-orange-100 text-orange-800',
  AprovadoCPS: 'bg-green-200 text-green-900',
  Reprovado: 'bg-red-100 text-red-800',
};

export const Home = (): JSX.Element => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const [allPgas, setAllPgas] = useState<PgaComUnidade[]>([]);
  const [allProjetos, setAllProjetos] = useState<AcaoProjeto[]>([]);
  const [selectedPgaId, setSelectedPgaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Regional tem view própria
    if (user?.tipo_usuario === 'Regional') return;
    // CPS e Admin não carregam dados de unidade, mas liberam o loading
    if (user?.tipo_usuario === 'CPS' || user?.tipo_usuario === 'Administrador') {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [projetosData, pgasData]: [AcaoProjeto[], PgaComUnidade[]] =
          await Promise.all([
            projectService.getAll(),
            api.get(API_ENDPOINTS.PGA).then((r) => r.data),
          ]);

        const pgasOrdenados = [...pgasData].sort((a, b) => b.ano - a.ano);
        setAllPgas(pgasOrdenados);
        setAllProjetos(projetosData);
        setSelectedPgaId(pgasOrdenados[0]?.pga_id ?? null);
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
        setError("Erro ao carregar dados do dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Regional tem dashboard dedicado
  if (user?.tipo_usuario === 'Regional') {
    return <HomeRegional />;
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

  const pgaSelecionado = allPgas.find((p) => p.pga_id === selectedPgaId) ?? allPgas[0] ?? null;
  const projetos = selectedPgaId
    ? allProjetos.filter((p) => p.pga_id === selectedPgaId)
    : allProjetos;

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

  const anoAtual = pgaSelecionado?.ano ?? new Date().getFullYear();
  const codigoUnidade = pgaSelecionado?.unidade?.codigo_fnnn ?? "—";
  const nomeUnidade = pgaSelecionado?.unidade?.nome_unidade ?? "—";
  const diretorNome = pgaSelecionado?.unidade?.diretor?.nome ?? "—";

  return (
    <div className="space-y-6">
      <h1 className="font-extrabold text-black text-2xl md:text-[32px] text-center">
        Dashboard PGA
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

      {/* Card de status do PGA */}
      {pgaSelecionado && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Status do PGA</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mt-0.5 ${STATUS_CLASS[pgaSelecionado.status]}`}>
                {STATUS_LABEL[pgaSelecionado.status]}
              </span>
              {pgaSelecionado.status === 'Reprovado' && pgaSelecionado.parecer_regional && (
                <p className="text-xs text-red-600 mt-1">Parecer: {pgaSelecionado.parecer_regional}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Seletor de ano — sempre visível */}
            <div className="relative flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={selectedPgaId ?? ""}
                onChange={(e) => setSelectedPgaId(e.target.value)}
                disabled={allPgas.length <= 1}
                className="border border-gray-300 rounded-md pl-2 pr-7 py-1.5 text-sm bg-white text-gray-700 appearance-none disabled:opacity-60 disabled:cursor-default cursor-pointer"
              >
                {allPgas.map((pga) => (
                  <option key={pga.pga_id} value={pga.pga_id}>
                    PGA {pga.ano}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 pointer-events-none" />
            </div>

            {/* Link para enviar — só Diretor, só EmElaboracao */}
            {user?.tipo_usuario === 'Diretor' && pgaSelecionado.status === 'EmElaboracao' && (
              <Link
                to={`${BASE_ROUTE}pgas`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[#ae0f0a] text-[#ae0f0a] hover:bg-[#ae0f0a]/5 transition-colors"
              >
                Enviar para Regional
              </Link>
            )}
          </div>
        </div>
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
