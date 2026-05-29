import React, { useState, useEffect } from "react";
import { AcaoProjeto } from "@/types/api";
import {
  eixoTematicoService,
  prioridadeAcaoService,
  temaService,
  userService,
  workloadHaeService,
  entregaveisService,
} from "@/services/commonServices";
import { situacoesService } from "@/features/settings/services/situacoesService";
import { projectService } from "@/features/projects/services/projectService";

interface ProjectEditFormProps {
  project: AcaoProjeto;
  onSave: (updated: AcaoProjeto) => void;
  onCancel: () => void;
}

interface ProjetoPessoaEdit {
  projeto_pessoa_id?: string;
  pessoa_id: string;
  pessoa_nome?: string;
  papel: "Responsavel" | "Colaborador";
  carga_horaria_semanal?: number;
  tipo_vinculo_hae_id?: string;
  tipo_vinculo_sigla?: string;
}

interface EtapaEdit {
  etapa_id?: string;
  descricao: string;
  entregavel_id?: string;
  numero_ref?: string;
  status_verificacao?: string;
  data_verificacao_prevista?: string;
  data_verificacao_realizada?: string;
}

interface SituacaoEdit {
  situacao_id: string;
  descricao?: string;
}

export const ProjectEditForm: React.FC<ProjectEditFormProps> = ({
  project,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<AcaoProjeto>>(project);
  const [pessoas, setPessoas] = useState<any[]>([]);
  const [temas, setTemas] = useState<any[]>([]);
  const [prioridades, setPrioridades] = useState<any[]>([]);
  const [eixos, setEixos] = useState<any[]>([]);
  const [tiposVinculo, setTiposVinculo] = useState<any[]>([]);
  const [entregaveis, setEntregaveis] = useState<any[]>([]);
  const [situacoes, setSituacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [pessoasProjeto, setPessoasProjeto] = useState<ProjetoPessoaEdit[]>([]);
  const [etapas, setEtapas] = useState<EtapaEdit[]>([]);
  const [situacoesProblema, setSituacoesProblema] = useState<SituacaoEdit[]>([]);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (project) {
      setPessoasProjeto(
        (project.pessoas || []).map((p: any) => ({
          projeto_pessoa_id: p.projeto_pessoa_id,
          pessoa_id: p.pessoa_id,
          pessoa_nome: p.pessoa?.nome,
          papel: p.papel,
          carga_horaria_semanal: p.carga_horaria_semanal,
          tipo_vinculo_hae_id: p.tipo_vinculo_hae_id,
          tipo_vinculo_sigla: p.tipo_vinculo_hae?.sigla,
        }))
      );

      setEtapas(
        (project.etapas || []).map((e: any) => ({
          etapa_id: e.etapa_id,
          descricao: e.descricao,
          entregavel_id: e.entregavel_id,
          numero_ref: e.numero_ref,
          status_verificacao: e.status_verificacao,
          data_verificacao_prevista: e.data_verificacao_prevista,
          data_verificacao_realizada: e.data_verificacao_realizada,
        }))
      );

      setSituacoesProblema(
        (project.situacoesProblemas || []).map((sp: any) => {
          const situacaoId = sp.situacao_id ?? sp.situacao_problema_id ?? sp.situacaoProblema?.situacao_id;
          const descricao = sp.descricao ?? sp.situacaoProblema?.descricao;
          return {
            situacao_id: situacaoId,
            descricao,
          };
        })
      );
    }
  }, [project]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [pessoasData, temasData, prioridadesData, eixosData, vinculosData, entregaveisData, situacoesData] =
        await Promise.all([
          userService.getAll(),
          temaService.getAll(),
          prioridadeAcaoService.getAll(),
          eixoTematicoService.getAll(),
          workloadHaeService.getAll(),
          entregaveisService.getAll(),
          situacoesService.getAll(),
        ]);

      setPessoas(pessoasData);
      setTemas(temasData);
      setPrioridades(prioridadesData);
      setEixos(eixosData);
      setTiposVinculo(vinculosData);
      setEntregaveis(entregaveisData);
      setSituacoes(situacoesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AcaoProjeto, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddPessoa = (papel: "Responsavel" | "Colaborador") => {
    setPessoasProjeto([
      ...pessoasProjeto,
      { pessoa_id: '', papel, carga_horaria_semanal: papel === "Colaborador" ? undefined : 0 },
    ]);
  };

  const handleUpdatePessoa = (
    index: number,
    field: keyof ProjetoPessoaEdit,
    value: any
  ) => {
    const updated = [...pessoasProjeto];
    updated[index] = { ...updated[index], [field]: value };
    setPessoasProjeto(updated);
  };

  const handleRemovePessoa = (index: number) => {
    setPessoasProjeto(pessoasProjeto.filter((_, i) => i !== index));
  };

  const handleAddEtapa = () => {
    setEtapas([...etapas, { descricao: "" }]);
  };

  const handleUpdateEtapa = (index: number, field: keyof EtapaEdit, value: any) => {
    const updated = [...etapas];
    updated[index] = { ...updated[index], [field]: value };
    setEtapas(updated);
  };

  const handleRemoveEtapa = (index: number) => {
    setEtapas(etapas.filter((_, i) => i !== index));
  };

  const handleAddSituacao = () => {
    setSituacoesProblema([...situacoesProblema, { situacao_id: '' }]);
  };

  const handleUpdateSituacao = (index: number, situacao_id: string) => {
    const updated = [...situacoesProblema];
    const situacao = situacoes.find((s) => s.situacao_id === situacao_id);
    updated[index] = {
      situacao_id,
      descricao: situacao?.descricao,
    };
    setSituacoesProblema(updated);
  };

  const handleRemoveSituacao = (index: number) => {
    setSituacoesProblema(situacoesProblema.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      const situacaoIds = situacoesProblema
        .filter((s) => s.situacao_id && s.situacao_id !== "")
        .map((s) => s.situacao_id);

      const pessoasData = pessoasProjeto
        .filter((p) => p.pessoa_id && p.pessoa_id !== "")
        .map((p) => ({
          pessoa_id: p.pessoa_id,
          papel: p.papel,
          carga_horaria_semanal: p.carga_horaria_semanal || null,
          tipo_vinculo_hae_id: p.tipo_vinculo_hae_id || null,
          projeto_pessoa_id: p.projeto_pessoa_id,
        }));

      const etapasData = etapas
        .filter((e) => e.descricao && e.descricao.trim().length > 0)
        .map((e) => ({
          descricao: e.descricao,
          entregavel_id: e.entregavel_id || null,
          numero_ref: e.numero_ref || null,
          status_verificacao: e.status_verificacao || null,
          data_verificacao_prevista: e.data_verificacao_prevista || null,
          data_verificacao_realizada: e.data_verificacao_realizada || null,
          etapa_id: e.etapa_id,
        }));

      const updatedProject = await projectService.update(project.acao_projeto_id, {
        nome_projeto: formData.nome_projeto,
        o_que_sera_feito: formData.o_que_sera_feito,
        por_que_sera_feito: formData.por_que_sera_feito,
        data_inicio: formData.data_inicio ? String(formData.data_inicio) : undefined,
        data_final: formData.data_final ? String(formData.data_final) : undefined,
        custo_total_estimado: formData.custo_total_estimado,
        fonte_recursos: formData.fonte_recursos,
        objetivos_institucionais_referenciados:
          formData.objetivos_institucionais_referenciados || undefined,
        eixo_id: formData.eixo_id,
        tema_id: formData.tema_id,
        prioridade_id: formData.prioridade_id,
        situacoes_problema_ids: situacaoIds,
        pessoas: pessoasData,
        etapas: etapasData,
      } as any);

      onSave(updatedProject);
    } catch (error: any) {
      console.error("Erro ao salvar projeto:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Erro desconhecido ao salvar projeto";
      alert(`Erro ao salvar projeto: ${errorMessage}`);
    }
  };

  if (loading) {
    return <div className="p-4">Carregando...</div>;
  }

  const filteredTemas = temas.filter((t) => t.eixo_id === formData.eixo_id);

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto p-4">
      {/* Informações Básicas */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Eixo Temático
            </label>
            <select
              value={formData.eixo_id || ""}
              onChange={(e) =>
                handleInputChange("eixo_id", e.target.value)
              }
              className="mt-1 block w-full border rounded-md p-2"
            >
              <option value="">Selecione um eixo</option>
              {eixos.map((e) => (
                <option key={e.eixo_id} value={e.eixo_id}>
                  {e.numero} - {e.nome_eixo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tema
            </label>
            <select
              value={formData.tema_id || ""}
              onChange={(e) =>
                handleInputChange("tema_id", e.target.value)
              }
              className="mt-1 block w-full border rounded-md p-2"
            >
              <option value="">Selecione um tema</option>
              {filteredTemas.map((t) => (
                <option key={t.tema_id} value={t.tema_id}>
                  {t.tema_num} - {t.descricao}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mt-4">
            Nome do Projeto
          </label>
          <input
            type="text"
            value={formData.nome_projeto || ""}
            onChange={(e) => handleInputChange("nome_projeto", e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prioridade
            </label>
            <select
              value={formData.prioridade_id || ""}
              onChange={(e) =>
                handleInputChange("prioridade_id", e.target.value)
              }
              className="mt-1 block w-full border rounded-md p-2"
            >
              <option value="">Selecione uma prioridade</option>
              {prioridades.map((p) => (
                <option key={p.prioridade_id} value={p.prioridade_id}>
                  {p.grau} - {p.descricao}
                </option>
              ))}
            </select>
          </div>

          <div></div>
        </div>
      </div>

      {/* Descrição */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold mb-4">Descrição</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            O que será feito
          </label>
          <textarea
            value={formData.o_que_sera_feito || ""}
            onChange={(e) =>
              handleInputChange("o_que_sera_feito", e.target.value)
            }
            rows={3}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Por que será feito
          </label>
          <textarea
            value={formData.por_que_sera_feito || ""}
            onChange={(e) =>
              handleInputChange("por_que_sera_feito", e.target.value)
            }
            rows={3}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Objetivos Institucionais Referenciados
          </label>
          <textarea
            value={formData.objetivos_institucionais_referenciados || ""}
            onChange={(e) =>
              handleInputChange(
                "objetivos_institucionais_referenciados",
                e.target.value
              )
            }
            rows={2}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
      </div>

      {/* Datas e Custos */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold mb-4">Período e Custos</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data Início
            </label>
            <input
              type="date"
              value={
                formData.data_inicio
                  ? new Date(formData.data_inicio).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => handleInputChange("data_inicio", e.target.value)}
              className="mt-1 block w-full border rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data Final
            </label>
            <input
              type="date"
              value={
                formData.data_final
                  ? new Date(formData.data_final).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => handleInputChange("data_final", e.target.value)}
              className="mt-1 block w-full border rounded-md p-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Custo R$
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.custo_total_estimado || 0}
              onChange={(e) =>
                handleInputChange(
                  "custo_total_estimado",
                  parseFloat(e.target.value)
                )
              }
              className="mt-1 block w-full border rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fonte dos Recursos
            </label>
            <input
              type="text"
              value={formData.fonte_recursos || ""}
              onChange={(e) =>
                handleInputChange("fonte_recursos", e.target.value)
              }
              className="mt-1 block w-full border rounded-md p-2"
            />
          </div>
        </div>
      </div>

      {/* Pessoas */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold mb-4">Pessoas Envolvidas</h3>
        {pessoasProjeto.map((pessoa, index) => (
          <div key={index} className="mb-4 p-3 border rounded-md">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium text-sm">
                {pessoa.papel === "Responsavel" ? "Responsável" : "Colaborador"}
              </h4>
              <button
                type="button"
                onClick={() => handleRemovePessoa(index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remover
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <select
                value={pessoa.pessoa_id || ""}
                onChange={(e) =>
                  handleUpdatePessoa(index, "pessoa_id", e.target.value)
                }
                className="text-sm border rounded p-2 col-span-2"
              >
                <option value="">Selecione uma pessoa</option>
                {pessoas.map((p) => (
                  <option key={p.pessoa_id} value={p.pessoa_id}>
                    {p.nome}
                  </option>
                ))}
              </select>

              {pessoa.papel === "Colaborador" && (
                <>
                  <input
                    type="number"
                    placeholder="CH/sem"
                    value={pessoa.carga_horaria_semanal || ""}
                    onChange={(e) =>
                      handleUpdatePessoa(
                        index,
                        "carga_horaria_semanal",
                        parseInt(e.target.value)
                      )
                    }
                    className="text-sm border rounded p-2"
                  />
                  <select
                    value={pessoa.tipo_vinculo_hae_id || ""}
                    onChange={(e) =>
                      handleUpdatePessoa(
                        index,
                        "tipo_vinculo_hae_id",
                        e.target.value
                      )
                    }
                    className="text-sm border rounded p-2"
                  >
                    <option value="">Tipo Vínculo</option>
                    {tiposVinculo.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.sigla} - {t.descricao}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>
        ))}

        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => handleAddPessoa("Responsavel")}
            className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Responsável
          </button>
          <button
            type="button"
            onClick={() => handleAddPessoa("Colaborador")}
            className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            + Colaborador
          </button>
        </div>
      </div>

      {/* Etapas */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold mb-4">Etapas</h3>
        {etapas.map((etapa, index) => (
          <div key={index} className="mb-4 p-3 border rounded-md">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium text-sm">Etapa #{index + 1}</h4>
              <button
                type="button"
                onClick={() => handleRemoveEtapa(index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remover
              </button>
            </div>

            <textarea
              placeholder="Descrição da etapa"
              value={etapa.descricao}
              onChange={(e) =>
                handleUpdateEtapa(index, "descricao", e.target.value)
              }
              rows={2}
              className="text-sm border rounded p-2 w-full mb-2"
            />

            <div className="grid grid-cols-2 gap-2 mb-2">
              <select
                value={etapa.entregavel_id || ""}
                onChange={(e) =>
                  handleUpdateEtapa(
                    index,
                    "entregavel_id",
                    e.target.value
                  )
                }
                className="text-sm border rounded p-2"
              >
                <option value="">Entregável</option>
                {entregaveis.map((e) => (
                  <option key={e.entregavel_id} value={e.entregavel_id}>
                    {e.entregavel_numero}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Nº Ref"
                value={etapa.numero_ref || ""}
                onChange={(e) =>
                  handleUpdateEtapa(index, "numero_ref", e.target.value)
                }
                className="text-sm border rounded p-2"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <select
                value={etapa.status_verificacao || ""}
                onChange={(e) =>
                  handleUpdateEtapa(index, "status_verificacao", e.target.value)
                }
                className="text-sm border rounded p-2"
              >
                <option value="">Status</option>
                <option value="Pendente">Pendente</option>
                <option value="OK">OK</option>
                <option value="RequerAcao">Requer Ação</option>
              </select>

              <input
                type="date"
                value={etapa.data_verificacao_prevista ? new Date(etapa.data_verificacao_prevista).toISOString().split("T")[0] : ""}
                onChange={(e) =>
                  handleUpdateEtapa(
                    index,
                    "data_verificacao_prevista",
                    e.target.value
                  )
                }
                className="text-sm border rounded p-2"
              />

              <input
                type="date"
                value={etapa.data_verificacao_realizada ? new Date(etapa.data_verificacao_realizada).toISOString().split("T")[0] : ""}
                onChange={(e) =>
                  handleUpdateEtapa(
                    index,
                    "data_verificacao_realizada",
                    e.target.value
                  )
                }
                className="text-sm border rounded p-2"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddEtapa}
          className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Adicionar Etapa
        </button>
      </div>

      {/* Situações-Problema */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold mb-4">Situações-Problema</h3>
        {situacoesProblema.map((situacao, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <select
              value={situacao.situacao_id || ""}
              onChange={(e) =>
                handleUpdateSituacao(index, e.target.value)
              }
              className="text-sm border rounded p-2 flex-grow"
            >
              <option value="">Selecione situação</option>
              {situacoes.map((s) => (
                <option key={s.situacao_id} value={s.situacao_id}>
                  {s.codigo_categoria} - {s.descricao}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => handleRemoveSituacao(index)}
              className="text-sm px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Remover
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddSituacao}
          className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Adicionar Situação
        </button>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Salvar Projeto
        </button>
      </div>
    </div>
  );
};

export default ProjectEditForm;
