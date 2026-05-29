import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import ProjectForm from "@/features/projects/components/projectForm";
import { BASE_ROUTE } from "@/lib/config";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export const AddProject = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useAuth();
  const typeId = searchParams.get("type");
  const eixoSelecionado = location.state?.eixoTematico;

  const canCreateProject =
    user?.tipo_usuario === 'Coordenador' || user?.tipo_usuario === 'Diretor';

  useEffect(() => {
    if (user && !canCreateProject) {
      navigate(`${BASE_ROUTE}projects/list`, { replace: true });
    }
  }, [user, canCreateProject, navigate]);

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