import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "@/hooks/useForm";
import { BASE_ROUTE } from "@/lib/config";
import { anexoService } from '../services/anexoService';
import { entregaveisService } from '@/services/commonServices';
import { EntregavelLinkSei, AcaoProjeto, EtapaProjeto } from '@/types/api';
import { ProjectService } from '@/features/projects/services/projectService';

const projectService = new ProjectService();

// Interface do formulário de anexo
interface AnexoFormData {
  acao_projeto_id: string;
  etapa_processo_id: string;
  entregavel_id: string;
  item: string;
  descricao: string;
  quantidade: number;
  preco_unitario_estimado: string;
  preco_total_estimado: string;
}

export const AnexoForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [entregaveis, setEntregaveis] = useState<EntregavelLinkSei[]>([]);
  const [projetos, setProjetos] = useState<AcaoProjeto[]>([]);
  const [etapasFiltradas, setEtapasFiltradas] = useState<EtapaProjeto[]>([]);
  const [loadingEtapas, setLoadingEtapas] = useState(false);

  // Validação do formulário
  const validate = (values: AnexoFormData) => {
    const errors: Partial<Record<keyof AnexoFormData, string>> = {};

    if (!values.acao_projeto_id) errors.acao_projeto_id = "Projeto é obrigatório";
    if (!values.etapa_processo_id) errors.etapa_processo_id = "Etapa é obrigatória";
    if (!values.entregavel_id) errors.entregavel_id = "Entregável é obrigatório";
    if (!values.item) errors.item = "Item é obrigatório";
    if (!values.descricao) errors.descricao = "Descrição é obrigatória";
    if (!values.quantidade || values.quantidade <= 0) errors.quantidade = "Quantidade deve ser maior que zero";
    if (!values.preco_unitario_estimado) errors.preco_unitario_estimado = "Preço unitário estimado é obrigatório";
    if (!values.preco_total_estimado) errors.preco_total_estimado = "Preço total estimado é obrigatório";

    return errors;
  };

  // Formulário
  const { values, errors, handleChange, handleBlur, setFieldValue } = useForm<AnexoFormData>({
    acao_projeto_id: "",
    etapa_processo_id: "",
    entregavel_id: "",
    item: "",
    descricao: "",
    quantidade: 1,
    preco_unitario_estimado: "",
    preco_total_estimado: "",
  }, validate);

  // Carregar projetos e entregáveis ao montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projetosData, entregaveisData] = await Promise.all([
          projectService.getAll(),
          entregaveisService.getAll(),
        ]);
        setProjetos(projetosData);
        setEntregaveis(entregaveisData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setErrorMessage("Não foi possível carregar os dados. Por favor, tente novamente.");
      }
    };

    fetchData();
  }, []);

  // Ao selecionar projeto, carregar suas etapas
  const handleProjetoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projetoId = e.target.value;
    setFieldValue("acao_projeto_id", projetoId);
    setFieldValue("etapa_processo_id", "");
    setEtapasFiltradas([]);

    if (!projetoId) return;

    try {
      setLoadingEtapas(true);
      const projeto = await projectService.getById(projetoId);
      setEtapasFiltradas(projeto.etapas ?? []);
    } catch (error) {
      console.error("Erro ao carregar etapas:", error);
      setErrorMessage("Não foi possível carregar as etapas do projeto.");
    } finally {
      setLoadingEtapas(false);
    }
  };

  // Formatar o valor para exibição em formato monetário
  const formatCurrency = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    const numericValue = parseInt(cleanValue, 10) / 100;

    if (isNaN(numericValue)) return "";

    return numericValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Processar input de valor monetário
  const handleCurrencyChange = (fieldName: "preco_unitario_estimado" | "preco_total_estimado") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^\d]/g, "");
      const formattedValue = formatCurrency(value);
      setFieldValue(fieldName, formattedValue);
    };

  // Enviar o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrorMessage("Por favor, corrija os erros no formulário.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const precoUnitValue = values.preco_unitario_estimado
        .replace(/[^\d,]/g, "")
        .replace(",", ".");
      const precoTotalValue = values.preco_total_estimado
        .replace(/[^\d,]/g, "")
        .replace(",", ".");

      await anexoService.create({
        etapa_processo_id: values.etapa_processo_id,
        entregavel_id: values.entregavel_id,
        item: values.item,
        descricao: values.descricao,
        quantidade: values.quantidade,
        preco_unitario_estimado: parseFloat(precoUnitValue),
        preco_total_estimado: parseFloat(precoTotalValue),
      });

      navigate(`${BASE_ROUTE}projects/list`);
    } catch (error) {
      console.error("Erro ao salvar anexo:", error);
      setErrorMessage("Erro ao salvar o anexo. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-4">
        <button
          onClick={() => navigate(`${BASE_ROUTE}projects`)}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Voltar para seleção
        </button>
      </div>

      <h1 className="font-extrabold text-black text-[32px] text-center mb-6">
        Adicionar Anexo ao Projeto
      </h1>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          {errorMessage}
        </div>
      )}

      <Card className="w-full shadow-[0px_0px_25px_#00000026] rounded-xl">
        <CardHeader className="bg-neutral-100 rounded-t-xl py-[15px] px-6">
          <h2 className="font-normal text-black text-[24px]">
            Preencha os dados do Anexo
          </h2>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Seleção de Projeto */}
            <div>
              <label htmlFor="acao_projeto_id" className="block text-sm font-medium text-gray-700 mb-1">
                Projeto: <span className="text-red-500">*</span>
              </label>
              <select
                id="acao_projeto_id"
                name="acao_projeto_id"
                value={values.acao_projeto_id}
                onChange={handleProjetoChange}
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-lg focus:ring-2 ${
                  errors.acao_projeto_id ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#ae0f0a]"
                }`}
              >
                <option value="">Selecione um projeto</option>
                {projetos.map((projeto) => (
                  <option key={projeto.acao_projeto_id} value={projeto.acao_projeto_id}>
                    {projeto.codigo_projeto ? `${projeto.codigo_projeto} – ` : ""}{projeto.nome_projeto}
                  </option>
                ))}
              </select>
              {errors.acao_projeto_id && (
                <p className="mt-1 text-sm text-red-600">{errors.acao_projeto_id}</p>
              )}
            </div>

            {/* Seleção de Etapa */}
            <div>
              <label htmlFor="etapa_processo_id" className="block text-sm font-medium text-gray-700 mb-1">
                Etapa do Projeto: <span className="text-red-500">*</span>
              </label>
              <select
                id="etapa_processo_id"
                name="etapa_processo_id"
                value={values.etapa_processo_id}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!values.acao_projeto_id || loadingEtapas}
                className={`w-full p-3 border rounded-lg focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.etapa_processo_id ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#ae0f0a]"
                }`}
              >
                <option value="">
                  {loadingEtapas
                    ? "Carregando etapas..."
                    : !values.acao_projeto_id
                    ? "Selecione um projeto primeiro"
                    : etapasFiltradas.length === 0
                    ? "Nenhuma etapa encontrada"
                    : "Selecione uma etapa"}
                </option>
                {etapasFiltradas.map((etapa) => (
                  <option key={etapa.etapa_id} value={etapa.etapa_id}>
                    {etapa.numero_ref ? `${etapa.numero_ref} – ` : ""}{etapa.descricao}
                  </option>
                ))}
              </select>
              {errors.etapa_processo_id && (
                <p className="mt-1 text-sm text-red-600">{errors.etapa_processo_id}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Entregável */}
              <div>
                <label htmlFor="entregavel_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Entregável: <span className="text-red-500">*</span>
                </label>
                <select
                  id="entregavel_id"
                  name="entregavel_id"
                  value={values.entregavel_id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 border rounded-lg focus:ring-2 ${
                    errors.entregavel_id ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#ae0f0a]"
                  }`}
                >
                  <option value="">Selecione um entregável</option>
                  {entregaveis.map((entregavel) => (
                    <option key={entregavel.entregavel_id} value={entregavel.entregavel_id}>
                      {`${entregavel.entregavel_numero} - ${entregavel.descricao}`}
                    </option>
                  ))}
                </select>
                {errors.entregavel_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.entregavel_id}</p>
                )}
              </div>

              {/* Item */}
              <div>
                <label htmlFor="item" className="block text-sm font-medium text-gray-700 mb-1">
                  Item: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="item"
                  name="item"
                  value={values.item}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 border rounded-lg focus:ring-2 ${
                    errors.item ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#ae0f0a]"
                  }`}
                  placeholder="Digite o nome do item"
                />
                {errors.item && (
                  <p className="mt-1 text-sm text-red-600">{errors.item}</p>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição: <span className="text-red-500">*</span>
              </label>
              <textarea
                id="descricao"
                name="descricao"
                value={values.descricao}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={3}
                className={`w-full p-3 border rounded-lg focus:ring-2 ${
                  errors.descricao ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#ae0f0a]"
                }`}
                placeholder="Descreva as especificações detalhadas do item"
              />
              {errors.descricao && (
                <p className="mt-1 text-sm text-red-600">{errors.descricao}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quantidade */}
              <div>
                <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade: <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="quantidade"
                  name="quantidade"
                  value={values.quantidade}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min="1"
                  className={`w-full p-3 border rounded-lg focus:ring-2 ${
                    errors.quantidade ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#ae0f0a]"
                  }`}
                />
                {errors.quantidade && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantidade}</p>
                )}
              </div>

              {/* Preço Unitário */}
              <div>
                <label htmlFor="preco_unitario_estimado" className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Unitário Estimado: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="preco_unitario_estimado"
                  name="preco_unitario_estimado"
                  value={values.preco_unitario_estimado}
                  onChange={handleCurrencyChange("preco_unitario_estimado")}
                  onBlur={handleBlur}
                  className={`w-full p-3 border rounded-lg focus:ring-2 ${
                    errors.preco_unitario_estimado ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#ae0f0a]"
                  }`}
                  placeholder="R$ 0,00"
                />
                {errors.preco_unitario_estimado && (
                  <p className="mt-1 text-sm text-red-600">{errors.preco_unitario_estimado}</p>
                )}
              </div>

              {/* Preço Total */}
              <div>
                <label htmlFor="preco_total_estimado" className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Total Estimado: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="preco_total_estimado"
                  name="preco_total_estimado"
                  value={values.preco_total_estimado}
                  onChange={handleCurrencyChange("preco_total_estimado")}
                  onBlur={handleBlur}
                  className={`w-full p-3 border rounded-lg focus:ring-2 ${
                    errors.preco_total_estimado ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#ae0f0a]"
                  }`}
                  placeholder="R$ 0,00"
                />
                {errors.preco_total_estimado && (
                  <p className="mt-1 text-sm text-red-600">{errors.preco_total_estimado}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                onClick={() => navigate(`${BASE_ROUTE}projects`)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#ae0f0a] text-white rounded-lg hover:bg-[#8e0c08] transition-colors"
              >
                {isSubmitting ? "Salvando..." : "Salvar Anexo"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
