import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building2,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  regionalService,
  type RegionalPgaStatus,
} from "@/services/regionalService";
import type { PgaComUnidade } from "@/types/api";

type TabId = "Submetido" | "Aprovado" | "Reprovado";

const STATUS_LABEL: Record<string, string> = {
  EmElaboracao: "Em elaboração",
  Submetido: "Aguardando análise",
  Aprovado: "Aprovado",
  Reprovado: "Reprovado",
};

const STATUS_BADGE: Record<string, string> = {
  EmElaboracao: "bg-gray-100 text-gray-700 border-gray-300",
  Submetido: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Aprovado: "bg-green-100 text-green-800 border-green-300",
  Reprovado: "bg-red-100 text-red-800 border-red-300",
};

export const RegionalDashboard = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<TabId>("Submetido");
  const [pgas, setPgas] = useState<PgaComUnidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPga, setSelectedPga] = useState<PgaComUnidade | null>(null);
  const [parecer, setParecer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadPgas = async (status: TabId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await regionalService.listPgas({
        status: status as RegionalPgaStatus,
      });
      setPgas(data);
    } catch (err) {
      console.error("Erro ao carregar PGAs regionais:", err);
      setError("Não foi possível carregar os PGAs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPgas(activeTab);
    setSelectedPga(null);
    setParecer("");
  }, [activeTab]);

  const kpis = useMemo(() => {
    const count = pgas.length;
    return {
      count,
      tabLabel: STATUS_LABEL[activeTab] ?? activeTab,
    };
  }, [pgas, activeTab]);

  const handleReview = async (status: "Aprovado" | "Reprovado") => {
    if (!selectedPga) return;

    if (status === "Reprovado" && !parecer.trim()) {
      toast({
        variant: "destructive",
        title: "Parecer obrigatório",
        description: "Informe o motivo da reprovação no campo de parecer.",
      });
      return;
    }

    try {
      setSubmitting(true);
      await regionalService.reviewPga(selectedPga.pga_id, {
        status,
        parecer: parecer.trim() || undefined,
      });
      toast({
        title: status === "Aprovado" ? "PGA aprovado" : "PGA reprovado",
        description: `Parecer registrado para a unidade ${selectedPga.unidade?.nome_completo ?? ""}.`,
      });
      setSelectedPga(null);
      setParecer("");
      await loadPgas(activeTab);
    } catch (err: any) {
      console.error("Erro ao registrar parecer:", err);
      toast({
        variant: "destructive",
        title: "Erro ao registrar parecer",
        description:
          err?.response?.data?.message ??
          "Não foi possível registrar o parecer agora.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderBadge = (status: string) => (
    <Badge
      variant="outline"
      className={`${STATUS_BADGE[status] ?? "bg-gray-100 text-gray-700"} font-medium`}
    >
      {STATUS_LABEL[status] ?? status}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-extrabold text-black text-2xl md:text-[32px]">
            Painel Regional
          </h1>
          <p className="text-gray-600">
            Avalie os PGAs enviados pelas unidades sob sua responsabilidade.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <ShieldCheck className="h-5 w-5 text-[#ae0f0a]" />
          <div>
            <p className="text-xs text-gray-500">{kpis.tabLabel}</p>
            <p className="text-lg font-semibold">{kpis.count}</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-fit md:grid-cols-3 gap-2 mb-4">
          <TabsTrigger
            value="Submetido"
            isActive={activeTab === "Submetido"}
            onClick={() => setActiveTab("Submetido")}
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            <span>Aguardando análise</span>
          </TabsTrigger>
          <TabsTrigger
            value="Aprovado"
            isActive={activeTab === "Aprovado"}
            onClick={() => setActiveTab("Aprovado")}
            className="flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Aprovados</span>
          </TabsTrigger>
          <TabsTrigger
            value="Reprovado"
            isActive={activeTab === "Reprovado"}
            onClick={() => setActiveTab("Reprovado")}
            className="flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            <span>Reprovados</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} isActive>
          {loading ? (
            <div className="flex justify-center items-center h-40 text-gray-500">
              Carregando PGAs...
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-40 text-red-600">
              {error}
            </div>
          ) : pgas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                <p>Nenhum PGA nesta categoria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pgas.map((pga) => {
                const isSelected = selectedPga?.pga_id === pga.pga_id;
                return (
                  <Card
                    key={pga.pga_id}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? "ring-2 ring-[#ae0f0a] shadow-md"
                        : "hover:shadow"
                    }`}
                    onClick={() => {
                      setSelectedPga(pga);
                      setParecer(pga.parecer_regional ?? "");
                    }}
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 mt-1 text-[#ae0f0a]" />
                        <div>
                          <CardTitle className="text-base">
                            {pga.unidade?.nome_completo ?? "Unidade"}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {pga.unidade?.codigo_fnnn ?? "—"} • Ano {pga.ano}
                          </CardDescription>
                        </div>
                      </div>
                      {renderBadge(pga.status as string)}
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2 text-sm text-gray-600">
                      {pga.regionalResponsavel?.nome && (
                        <p>
                          <span className="font-medium">Analista:</span>{" "}
                          {pga.regionalResponsavel.nome}
                        </p>
                      )}
                      {pga.data_parecer_regional && (
                        <p>
                          <span className="font-medium">Parecer em:</span>{" "}
                          {new Date(pga.data_parecer_regional).toLocaleDateString(
                            "pt-BR",
                          )}
                        </p>
                      )}
                      {pga.parecer_regional && (
                        <p className="text-xs bg-gray-50 border border-gray-200 rounded p-2">
                          {pga.parecer_regional}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Painel de avaliação */}
      {selectedPga && activeTab === "Submetido" && (
        <Card className="shadow-[0px_0px_25px_#00000026] border-t-4 border-t-[#ae0f0a]">
          <CardHeader>
            <CardTitle>
              Avaliar PGA — {selectedPga.unidade?.nome_completo}
            </CardTitle>
            <CardDescription>
              {selectedPga.unidade?.codigo_fnnn ?? "—"} • Ano {selectedPga.ano}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parecer
              </label>
              <textarea
                value={parecer}
                onChange={(e) => setParecer(e.target.value)}
                placeholder="Descreva o parecer da regional (obrigatório em caso de reprovação)"
                rows={5}
                disabled={submitting}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ae0f0a]/20 disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedPga(null);
                  setParecer("");
                }}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReview("Reprovado")}
                disabled={submitting}
                className="flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reprovar
              </Button>
              <Button
                onClick={() => handleReview("Aprovado")}
                disabled={submitting}
                className="bg-[#ae0f0a] hover:bg-[#8e0c08] text-white flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Aprovar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
