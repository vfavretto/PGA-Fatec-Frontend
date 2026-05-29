import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { BASE_ROUTE } from "@/lib/config";
import { eixoTematicoService, entregaveisService } from "@/services/commonServices";
import { EixoTematico } from "@/types/api";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Entregavel {
  id: number;
  nome: string;
  descricao: string;
}

export const SelectAnexo = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreateProject =
    user?.tipo_usuario === 'Coordenador' || user?.tipo_usuario === 'Diretor';

  const [activeTab, setActiveTab] = useState<"projects" | "anexos">(canCreateProject ? "projects" : "anexos");

  useEffect(() => {
    if (user && !canCreateProject) {
      navigate(`${BASE_ROUTE}projects/list`, { replace: true });
    }
  }, [user, canCreateProject, navigate]);

  const [eixosTematicos, setEixosTematicos] = useState<EixoTematico[]>([]);
  const [loadingEixos, setLoadingEixos] = useState(false);
  const [errorEixos, setErrorEixos] = useState<string | null>(null);

  const [entregaveis, setEntregaveis] = useState<Entregavel[]>([]);
  const [loadingEntregaveis, setLoadingEntregaveis] = useState(false);
  const [errorEntregaveis, setErrorEntregaveis] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "projects") {
      loadEixosTematicos();
    } else if (activeTab === "anexos") {
      loadEntregaveis();
    }
  }, [activeTab]);

  const loadEixosTematicos = async () => {
    try {
      setLoadingEixos(true);
      setErrorEixos(null);
      
      const data = await eixoTematicoService.getAll();
      setEixosTematicos(data);
    } catch (error) {
      console.error("Erro ao carregar eixos temáticos:", error);
      setErrorEixos("Erro ao carregar tipos de projeto. Tente novamente.");
    } finally {
      setLoadingEixos(false);
    }
  };

  const loadEntregaveis = async () => {
    try {
      setLoadingEntregaveis(true);
      setErrorEntregaveis(null);
      
      const data = await entregaveisService.getAll();
      console.log("Entregáveis carregados:", data);
      setEntregaveis(data);
    } catch (error) {
      console.error("Erro ao carregar entregáveis:", error);
      setErrorEntregaveis("Erro ao carregar anexos. Tente novamente.");
    } finally {
      setLoadingEntregaveis(false);
    }
  };

  const handleItemClick = (type: string, id: number) => {
    if (type === "project") {
      const eixoSelecionado = eixosTematicos.find(eixo => eixo.eixo_id === id);
      navigate(`${BASE_ROUTE}projects/new?type=${id}`, {
        state: {
          eixoTematico: eixoSelecionado
        }
      });
    } else {
      navigate(`${BASE_ROUTE}anexos/new?type=${id}`);
    }
  };

  return (
    <div className="px-4 py-6">
      <h1 className="font-extrabold text-black text-[32px] text-center mb-6">
        Adicionar Novo Item
      </h1>

      {/* Sistema de Tabs */}
      <div className="flex border-b mb-8">
        {canCreateProject && (
          <button
            className={`px-6 py-3 font-medium text-lg transition-colors ${
              activeTab === "projects"
                ? "border-b-2 border-[#ae0f0a] text-[#ae0f0a] font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("projects")}
          >
            Projetos
          </button>
        )}
        <button
          className={`px-6 py-3 font-medium text-lg transition-colors ${
            activeTab === "anexos"
              ? "border-b-2 border-[#ae0f0a] text-[#ae0f0a] font-semibold"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("anexos")}
        >
          Anexos
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="mt-4">
        {/* Tab de Projetos */}
        {activeTab === "projects" && (
          <>
            {loadingEixos ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500 mr-3" />
                <span className="text-gray-600">Carregando tipos de projeto...</span>
              </div>
            ) : errorEixos ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                <p className="text-lg font-medium text-gray-800 mb-2">Erro ao carregar dados</p>
                <p className="text-gray-600 mb-4">{errorEixos}</p>
                <button onClick={loadEixosTematicos} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Tentar novamente
                </button>
              </div>
            ) : eixosTematicos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-yellow-500 mb-3" />
                <p className="text-lg font-medium text-gray-800 mb-2">Nenhum eixo temático encontrado</p>
                <p className="text-gray-600 mb-4">Não existem eixos temáticos cadastrados no sistema.</p>
                <p className="text-gray-600">Entre em contato com o administrador para cadastrar eixos temáticos.</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 text-center mb-6">Selecione o tipo de projeto que deseja criar</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eixosTematicos.map((eixo) => (
                    <Card
                      key={eixo.eixo_id}
                      className="p-6 text-center border-2 border-gray-200 hover:border-[#ae0f0a] hover:bg-[#ae0f0a]/5 transition-all cursor-pointer shadow-md"
                      onClick={() => handleItemClick("project", eixo.eixo_id)}
                    >
                      <h3 className="text-lg font-semibold">
                        {eixo.numero.toString().padStart(2, "0")} - {eixo.nome_eixo}
                      </h3>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Tab de Anexos - Agora com dados dinâmicos */}
        {activeTab === "anexos" && (
          <>
            {loadingEntregaveis ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500 mr-3" />
                <span className="text-gray-600">Carregando tipos de anexos...</span>
              </div>
            ) : errorEntregaveis ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                <p className="text-lg font-medium text-gray-800 mb-2">Erro ao carregar dados</p>
                <p className="text-gray-600 mb-4">{errorEntregaveis}</p>
                <button onClick={loadEntregaveis} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Tentar novamente
                </button>
              </div>
            ) : entregaveis.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-yellow-500 mb-3" />
                <p className="text-lg font-medium text-gray-800 mb-2">Nenhum anexo encontrado</p>
                <p className="text-gray-600 mb-4">Não existem anexos cadastrados no sistema.</p>
                <p className="text-gray-600">Entre em contato com o administrador para cadastrar anexos.</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 text-center mb-6">Selecione o anexo que deseja criar</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {entregaveis.map((anexo) => (
                    <Card
                      key={anexo.id}
                      className="p-6 text-center border-2 border-gray-200 hover:border-[#ae0f0a] hover:bg-[#ae0f0a]/5 transition-all cursor-pointer shadow-md"
                      onClick={() => handleItemClick("anexo", anexo.id)}
                    >
                      <h3 className="text-lg font-semibold mb-2">{anexo.nome}</h3>
                      <p className="text-sm text-gray-500">{anexo.descricao}</p>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};