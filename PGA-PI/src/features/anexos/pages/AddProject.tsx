import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import ProjectForm from "@/features/projects/components/projectForm";
import { BASE_ROUTE } from "@/lib/config";
import { usePermissions } from "@/hooks/usePermissions";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AddProject = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const typeId = searchParams.get("type");
  const eixoSelecionado = location.state?.eixoTematico;
  const { canEditProjects } = usePermissions();

  if (!canEditProjects) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white border border-gray-200 rounded-xl shadow-sm text-center">
        <Lock className="h-10 w-10 text-[#ae0f0a] mx-auto mb-3" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Sem permissão para criar projetos
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Seu perfil não tem acesso à criação de projetos do PGA.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate(`${BASE_ROUTE}dashboard`)}
        >
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <button
          onClick={() => navigate(`${BASE_ROUTE}projects`)}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Voltar para seleção
        </button>
      </div>

      <div className="mb-6">
        <h1 className="font-extrabold text-black text-[32px] text-center mb-2">
          Criar Novo Projeto
        </h1>
        {eixoSelecionado && (
          <p className="text-center text-gray-600 text-lg mb-4">
            {eixoSelecionado.numero.toString().padStart(2, "0")} - {eixoSelecionado.nome}
          </p>
        )}
      </div>

      <ProjectForm eixoSelecionado={eixoSelecionado} />
    </>
  );
};