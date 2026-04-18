import React, { useState, useEffect } from "react";
import {
  PapelProjeto,
  TipoVinculoHAE,
  ProjetoPessoa,
  StatusVerificacao,
  EtapaProcesso,
  AttachmentItem,
  PrioridadeAcao,
  PessoaAPI,
} from "./projectFormTypes";
import {
  eixoTematicoService,
  prioridadeAcaoService,
  temaService,
  userService,
  workloadHaeService,
  entregaveisService,
} from "@/services/commonServices";
import { useAuth } from "@/context/AuthContext";
import { situacoesService } from "@/features/settings/services/situacoesService";
import { TipoUsuario, EntregavelLinkSei, SituacaoProblema } from "@/types/api"; // Importar tipo do entregável
import { projectService } from "@/features/projects/services/projectService";
import { processStepService } from "@/services/processStepService";
import { anexoService } from "@/features/anexos/services/anexoService";
import { projetoPessoaService } from "@/services/projectPersonService";
import { pgaService } from "@/services/pgaService";
import { usePermissions } from "@/hooks/usePermissions";
import { Lock } from "lucide-react";

// --- Utility Functions ---
const formatCurrency = (value: string): string => {
  const number = parseFloat(value.replace(/[^\d]/g, "")) / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number);
};

const parseCurrencyInput = (value: string): string => {
  return value.replace(/\D/g, "");
};

interface ProjectFormProps {
  eixoSelecionado?: {
    eixo_id: number;
    numero: number;
    nome: string;
  };
}

const ProjectForm: React.FC<ProjectFormProps> = ({ eixoSelecionado }) => {
  const { user } = useAuth();
  const { canEditProjects } = usePermissions();

  const [eixosTematicos, setEixosTematicos] = useState<any[]>([]);
  const [loadingEixos, setLoadingEixos] = useState(false);
  const [errorEixos, setErrorEixos] = useState<string | null>(null);

  const [prioridades, setPrioridades] = useState<PrioridadeAcao[]>([]);
  const [loadingPrioridades, setLoadingPrioridades] = useState(false);
  const [errorPrioridades, setErrorPrioridades] = useState<string | null>(null);

  const [temas, setTemas] = useState<any[]>([]);
  const [filteredTemas, setFilteredTemas] = useState<any[]>([]);
  const [loadingTemas, setLoadingTemas] = useState(false);
  const [errorTemas, setErrorTemas] = useState<string | null>(null);

  const [tiposVinculoHAE, setTiposVinculoHAE] = useState<TipoVinculoHAE[]>([]);
  const [loadingVinculos, setLoadingVinculos] = useState(false);
  const [errorVinculos, setErrorVinculos] = useState<string | null>(null);

  const [entregaveis, setEntregaveis] = useState<EntregavelLinkSei[]>([]);
  const [loadingEntregaveis, setLoadingEntregaveis] = useState(false);
  const [errorEntregaveis, setErrorEntregaveis] = useState<string | null>(null);

  const [situacoesProblemaAPI, setSituacoesProblemaAPI] = useState<SituacaoProblema[]>([]);
  const [loadingSituacoes, setLoadingSituacoes] = useState(false);
  const [errorSituacoes, setErrorSituacoes] = useState<string | null>(null);

  const [eixoId, setEixoId] = useState<string>(
    eixoSelecionado ? eixoSelecionado.eixo_id.toString() : ""
  );

  const [temaId, setTemaId] = useState<string>("");

  const [nomeProjeto, setNomeProjeto] = useState<string>("");
  const [oQueSeraFeito, setOQueSeraFeito] = useState<string>("");
  const [porQueSeraFeito, setPorQueSeraFeito] = useState<string>("");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFinal, setDataFinal] = useState<string>("");
  const [custoEstimado, setCustoEstimado] = useState<string>("");
  const [fonteRecursos, setFonteRecursos] = useState<string>("");
  const [prioridadeId, setPrioridadeId] = useState<string>("");
  const [
    objetivosInstitucionaisReferenciados,
    setObjetivosInstitucionaisReferenciados,
  ] = useState<string>("");
  const [obrigatorioInclusao, setObrigatorioInclusao] =
    useState<boolean>(false);
  const [obrigatorioSustentabilidade, setObrigatorioSustentabilidade] =
    useState<boolean>(false);

  const [pessoasProjeto, setPessoasProjeto] = useState<ProjetoPessoa[]>([
    { id: 0, pessoaId: "", nome: "", papel: PapelProjeto.Responsavel },
  ]);
  const [etapasProcesso, setEtapasProcesso] = useState<EtapaProcesso[]>([
    { id: 0, descricao: "", statusVerificacao: StatusVerificacao.Pendente },
  ]);
  const [situacoesProblema, setSituacoesProblema] = useState<
    Array<{
      id: string;
      descricao: string;
    }>
  >([{ id: "", descricao: "" }]);
  const [aquisicoes, setAquisicoes] = useState<AttachmentItem[]>([]);

  const [pgas, setPgas] = useState<any[]>([]);
  const [loadingPgas, setLoadingPgas] = useState(false);
  const [errorPgas, setErrorPgas] = useState<string | null>(null);
  const [pgaId, setPgaId] = useState<string>("");

  useEffect(() => {
    carregarEixosTematicos();
    carregarPrioridades();
    carregarTemas();
    carregarPessoas();
    carregarTiposVinculoHAE();
    carregarEntregaveis();
    carregarSituacoesProblema();
    carregarPGAs();
  }, []);

  useEffect(() => {
    if (eixoId && temas.length > 0) {
      const temasDoEixo = temas.filter(
        (tema) => tema.eixo_id === parseInt(eixoId)
      );
      setFilteredTemas(temasDoEixo);
      setTemaId("");
    } else {
      setFilteredTemas([]);
    }
  }, [eixoId, temas]);

  const carregarEixosTematicos = async () => {
    try {
      setLoadingEixos(true);
      setErrorEixos(null);

      const data = await eixoTematicoService.getAll();
      console.log("Eixos temáticos carregados:", data);
      setEixosTematicos(data);
    } catch (error) {
      console.error("Erro ao carregar eixos temáticos:", error);
      setErrorEixos("Não foi possível carregar os eixos temáticos.");
    } finally {
      setLoadingEixos(false);
    }
  };

  const carregarPrioridades = async () => {
    try {
      setLoadingPrioridades(true);
      setErrorPrioridades(null);

      const data = await prioridadeAcaoService.getAll();
      console.log("Prioridades carregadas:", data);
      setPrioridades(data);
    } catch (error) {
      console.error("Erro ao carregar prioridades:", error);
      setErrorPrioridades("Não foi possível carregar as prioridades de ação.");
    } finally {
      setLoadingPrioridades(false);
    }
  };

  const carregarTemas = async () => {
    try {
      setLoadingTemas(true);
      setErrorTemas(null);

      const data = await temaService.getAll();
      console.log("Temas carregados:", data);
      setTemas(data);
    } catch (error) {
      console.error("Erro ao carregar temas:", error);
      setErrorTemas("Não foi possível carregar os temas.");
    } finally {
      setLoadingTemas(false);
    }
  };

  const [pessoas, setPessoas] = useState<PessoaAPI[]>([]);
  const [loadingPessoas, setLoadingPessoas] = useState(false);
  const [errorPessoas, setErrorPessoas] = useState<string | null>(null);

  const carregarPessoas = async () => {
    try {
      setLoadingPessoas(true);
      setErrorPessoas(null);

      if (!user) return;

      let pessoasData: PessoaAPI[] = [];

      const userTipo =
        (user as any)?.tipo_usuario || (user as any)?.tipoUsuario;
      const unidadeId = (user as any)?.unidades?.[0]?.unidade_id || 1;

      console.log("Tipo de usuário:", userTipo);

      if (
        userTipo === TipoUsuario.ADMINISTRADOR ||
        userTipo === TipoUsuario.CPS
      ) {
        console.log("Carregando todas as pessoas (admin/CPS)");
        pessoasData = await userService.getAll();
      } else {
        console.log(`Carregando pessoas da unidade: ${unidadeId}`);
        pessoasData = await userService.getByUnidade(unidadeId);
      }

      console.log("Pessoas carregadas:", pessoasData);
      setPessoas(pessoasData);
    } catch (error) {
      console.error("Erro ao carregar pessoas:", error);
      setErrorPessoas("Não foi possível carregar a lista de pessoas.");
    } finally {
      setLoadingPessoas(false);
    }
  };

  const carregarTiposVinculoHAE = async () => {
    try {
      setLoadingVinculos(true);
      setErrorVinculos(null);
      
      const data = await workloadHaeService.getAll();
      console.log('Tipos de vínculo HAE carregados:', data);
      setTiposVinculoHAE(data);
    } catch (error) {
      console.error('Erro ao carregar tipos de vínculo HAE:', error);
      setErrorVinculos('Não foi possível carregar os tipos de vínculo HAE.');
    } finally {
      setLoadingVinculos(false);
    }
  };

  const carregarEntregaveis = async () => {
    try {
      setLoadingEntregaveis(true);
      setErrorEntregaveis(null);
      
      const data = await entregaveisService.getAll();
      console.log('Entregáveis carregados:', data);
      setEntregaveis(data);
    } catch (error) {
      console.error('Erro ao carregar entregáveis:', error);
      setErrorEntregaveis('Não foi possível carregar a lista de entregáveis.');
    } finally {
      setLoadingEntregaveis(false);
    }
  };

  const carregarSituacoesProblema = async () => {
    try {
      setLoadingSituacoes(true);
      setErrorSituacoes(null);
      
      const data = await situacoesService.getAll();
      console.log('Situações problema carregadas:', data);
      setSituacoesProblemaAPI(data);
    } catch (error) {
      console.error('Erro ao carregar situações problema:', error);
      setErrorSituacoes('Não foi possível carregar a lista de situações problema.');
    } finally {
      setLoadingSituacoes(false);
    }
  };

  const carregarPGAs = async () => {
    try {
      setLoadingPgas(true);
      setErrorPgas(null);
      const data = await pgaService.getAll();
      setPgas(data);
    } catch (error) {
      setErrorPgas("Não foi possível carregar os PGAs.");
    } finally {
      setLoadingPgas(false);
    }
  };

  // Formatação de código para temas
  const formatarCodigoTema = (
    eixoNumero: number,
    temaNumero: number
  ): string => {
    return `cat ${eixoNumero}.${temaNumero.toString().padStart(2, "0")}`;
  };

  // Função para obter o número do eixo
  const getEixoNumero = (eixoId: number): number => {
    const eixo = eixosTematicos.find((e) => e.eixo_id === eixoId);
    return eixo ? eixo.numero : 0;
  };

  const handleAddPessoaProjeto = (papel: PapelProjeto) => {
    setPessoasProjeto([
      ...pessoasProjeto,
      {
        id: pessoasProjeto.length,
        pessoaId: "",
        nome: "",
        papel: papel,
        ...(papel === PapelProjeto.Colaborador && {
          cargaHorariaSemanal: "",
          tipoVinculoHAE: "",
        }),
      },
    ]);
  };

  const handlePessoaProjetoChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    const newPessoasProjeto = [...pessoasProjeto];
    const currentPessoa = newPessoasProjeto[index];

    if (name === "pessoaId") {
      const selectedPessoa = pessoas.find(
        (p) => p.pessoa_id.toString() === value
      );

      newPessoasProjeto[index] = {
        ...currentPessoa,
        pessoaId: value,
        nome: selectedPessoa ? selectedPessoa.nome : "",
      };
    } else {
      newPessoasProjeto[index] = { ...currentPessoa, [name]: value };
    }
    setPessoasProjeto(newPessoasProjeto);
  };

  const handleRemovePessoaProjeto = (index: number) => {
    const newPessoasProjeto = pessoasProjeto.filter((_, i) => i !== index);
    setPessoasProjeto(newPessoasProjeto);
  };

  const handleAddEtapaProcesso = () => {
    setEtapasProcesso([
      ...etapasProcesso,
      {
        id: Date.now(),
        descricao: "",
        // Todos os campos opcionais não precisam ser inicializados
        // statusVerificacao não é mais obrigatório, então não precisa inicializar
      },
    ]);
  };

  const handleEtapaProcessoChange = (
    index: number,
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;
    const newEtapasProcesso = [...etapasProcesso];
    newEtapasProcesso[index] = { ...newEtapasProcesso[index], [name]: value };
    setEtapasProcesso(newEtapasProcesso);
  };

  const handleStatusChange = (index: number, status: StatusVerificacao) => {
    const newEtapasProcesso = [...etapasProcesso];

    // Se já estava no mesmo status, volte para Pendente
    if (newEtapasProcesso[index].statusVerificacao === status) {
      newEtapasProcesso[index] = {
        ...newEtapasProcesso[index],
        statusVerificacao: StatusVerificacao.Pendente,
      };
    } else {
      // Caso contrário, defina para o novo status
      newEtapasProcesso[index] = {
        ...newEtapasProcesso[index],
        statusVerificacao: status,
      };
    }

    setEtapasProcesso(newEtapasProcesso);
  };

  const handleRemoveEtapaProcesso = (index: number) => {
    const newEtapasProcesso = etapasProcesso.filter((_, i) => i !== index);
    setEtapasProcesso(newEtapasProcesso);
  };

  const handleAddSituacaoProblema = () => {
    setSituacoesProblema([...situacoesProblema, { id: "", descricao: "" }]);
  };

  const handleSituacaoProblemaChange = (
    index: number,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { value } = event.target;
    const situacao = situacoesProblemaAPI.find(
      (s) => s.situacao_id.toString() === value
    );

    const newSituacoesProblema = [...situacoesProblema];
    newSituacoesProblema[index] = {
      id: value,
      descricao: situacao 
        ? `${situacao.codigo_categoria} - ${situacao.descricao}` 
        : "",
    };

    setSituacoesProblema(newSituacoesProblema);
  };

  const handleRemoveSituacaoProblema = (index: number) => {
    const newSituacoesProblema = situacoesProblema.filter(
      (_, i) => i !== index
    );
    setSituacoesProblema(newSituacoesProblema);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const projetoCriado = await projectService.create({
        codigo_projeto: "",
        nome_projeto: nomeProjeto,
        pga_id: parseInt(pgaId),
        tema_id: parseInt(temaId),
        eixo_id: parseInt(eixoId),
        prioridade_id: parseInt(prioridadeId),
        o_que_sera_feito: oQueSeraFeito,
        por_que_sera_feito: porQueSeraFeito,
        data_inicio: dataInicio,
        data_final: dataFinal,
        objetivos_institucionais_referenciados: objetivosInstitucionaisReferenciados,
        obrigatorio_inclusao: obrigatorioInclusao,
        obrigatorio_sustentabilidade: obrigatorioSustentabilidade,
        custo_total_estimado: custoEstimado
          ? parseFloat(custoEstimado.replace(/[^\d]/g, "")) / 100
          : 0,
        fonte_recursos: fonteRecursos,
      });

      const acaoProjetoId = projetoCriado.acao_projeto_id;

      // 2. Criar pessoas vinculadas ao projeto
      for (const pessoa of pessoasProjeto) {
        await projetoPessoaService.create({
          acao_projeto_id: acaoProjetoId,
          pessoa_id: parseInt(pessoa.pessoaId),
          papel: pessoa.papel,
          carga_horaria_semanal: pessoa.cargaHorariaSemanal
            ? parseInt(pessoa.cargaHorariaSemanal)
            : undefined,
          tipo_vinculo_hae_id:
            pessoa.tipoVinculoHAE && pessoa.tipoVinculoHAE !== "NaoSeAplica"
              ? parseInt(pessoa.tipoVinculoHAE)
              : undefined,
        });
      }

      // 3. Criar etapas do processo e anexos vinculados
      for (const etapa of etapasProcesso) {
        const etapaCriada = await processStepService.create({
          acao_projeto_id: acaoProjetoId,
          descricao: etapa.descricao,
          entregavel_id: etapa.entregavelLinkSei
            ? parseInt(etapa.entregavelLinkSei)
            : undefined,
          numero_ref: etapa.numeroRef,
          data_verificacao_prevista: etapa.dataVerificacaoPrevista
            ? new Date(etapa.dataVerificacaoPrevista).toISOString()
            : undefined,
          data_verificacao_realizada: etapa.dataVerificacaoRealizada
            ? new Date(etapa.dataVerificacaoRealizada).toISOString()
            : undefined,
          status_verificacao: etapa.statusVerificacao,
        });

        if (etapa.anexos && etapa.anexos.length > 0) {
          for (const anexo of etapa.anexos) {
            await anexoService.create({
              etapa_processo_id: etapaCriada.etapa_id,
              entregavel_id: etapa.entregavelLinkSei
                ? parseInt(etapa.entregavelLinkSei)
                : undefined,
              item: anexo.descricao,
              descricao: anexo.descricao || "",
              quantidade: anexo.quantidade,
              preco_unitario_estimado: anexo.preco_unitario_estimado
                ? anexo.preco_unitario_estimado
                : 0,
              preco_total_estimado: anexo.preco_total_estimado
                ? anexo.preco_total_estimado
                : 0,
            });
          }
        }
      }

      // 4. (Opcional) Situações problema, se houver endpoint específico

      alert("Projeto registrado com sucesso!");
      // Redirecionar ou resetar formulário conforme necessário

    } catch (error) {
      console.error("Erro ao registrar projeto:", error);
      alert("Erro ao registrar projeto. Verifique os dados e tente novamente.");
    }
  };

  if (!canEditProjects) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm text-center">
        <Lock className="h-10 w-10 text-[#ae0f0a] mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          Sem permissão para editar projetos
        </h2>
        <p className="text-sm text-gray-600">
          Seu perfil não tem permissão para criar ou editar projetos do PGA.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 p-4 bg-white shadow-md rounded-lg"
    >
      {/* Layout em duas colunas para Eixo Temático e Tema do Projeto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PRIMEIRO CAMPO: Eixo Temático */}
        <div>
          <label
            htmlFor="eixoId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Eixo Temático:
          </label>
          <select
            id="eixoId"
            value={eixoId}
            onChange={(e) => setEixoId(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            disabled={loadingEixos || !!eixoSelecionado}
          >
            <option value="">
              {loadingEixos
                ? "Carregando eixos temáticos..."
                : "Selecione um Eixo Temático"}
            </option>
            {eixosTematicos.map((eixo) => (
              <option key={eixo.eixo_id} value={eixo.eixo_id}>
                {eixo.numero.toString().padStart(2, "0")} - {eixo.nome}
              </option>
            ))}
          </select>
          {errorEixos && (
            <p className="text-red-500 text-sm mt-1">{errorEixos}</p>
          )}

          {/* Se tivermos um eixo selecionado, mostramos de forma mais clara */}
          {eixoSelecionado && (
            <p className="text-sm text-gray-600 mt-1">
              Eixo pré-selecionado da etapa anterior.
            </p>
          )}
        </div>

        {/* SEGUNDO CAMPO: ID/Tema do Projeto */}
        <div>
          <label
            htmlFor="temaId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ID/Tema do Projeto (Conforme PGA):
          </label>
          <select
            id="temaId"
            value={temaId}
            onChange={(e) => setTemaId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            required
            disabled={!eixoId || loadingTemas}
          >
            <option value="">
              {loadingTemas
                ? "Carregando temas..."
                : !eixoId
                ? "Selecione primeiro um eixo temático"
                : "Selecione um tema..."}
            </option>
            {filteredTemas.map((tema) => (
              <option key={tema.tema_id} value={tema.tema_id.toString()}>
                {formatarCodigoTema(getEixoNumero(tema.eixo_id), tema.tema_num)}{" "}
                - {tema.descricao}
              </option>
            ))}
          </select>
          {errorTemas && (
            <p className="text-red-500 text-sm mt-1">{errorTemas}</p>
          )}
          {!loadingTemas && eixoId && filteredTemas.length === 0 && (
            <p className="text-amber-500 text-sm mt-1">
              Não há temas cadastrados para este eixo.
            </p>
          )}
        </div>
      </div>

      {/* Nome do Projeto e Ano */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="nomeProjeto"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nome do Projeto (Opcional):
          </label>
          <input
            type="text"
            id="nomeProjeto"
            value={nomeProjeto}
            onChange={(e) => setNomeProjeto(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="pgaId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ano (PGA):
          </label>
          <select
            id="pgaId"
            value={pgaId}
            onChange={(e) => setPgaId(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            disabled={loadingPgas}
          >
            <option value="">
              {loadingPgas ? "Carregando anos do PGA..." : "Selecione o ano do PGA"}
            </option>
            {pgas.map((pga) => (
              <option key={pga.pga_id} value={pga.pga_id}>
                {pga.ano}
              </option>
            ))}
          </select>
          {errorPgas && (
            <p className="text-red-500 text-sm mt-1">{errorPgas}</p>
          )}
        </div>
      </div>

      {/* ATUALIZADO: Prioridade/Origem da Ação - Agora usando dados dinâmicos */}
      <div>
        <label
          htmlFor="prioridadeId"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Prioridade/Origem da Ação:
        </label>
        <select
          id="prioridadeId"
          value={prioridadeId}
          onChange={(e) => setPrioridadeId(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          disabled={loadingPrioridades}
        >
          <option value="">
            {loadingPrioridades
              ? "Carregando prioridades..."
              : "Selecione a Prioridade/Origem"}
          </option>
          {prioridades.map((prio) => (
            <option
              key={prio.prioridade_id}
              value={prio.prioridade_id.toString()}
            >
              {prio.grau} - {prio.descricao} ({prio.tipo_gestao})
            </option>
          ))}
        </select>
        {errorPrioridades && (
          <p className="text-red-500 text-sm mt-1">{errorPrioridades}</p>
        )}
        {!loadingPrioridades && prioridades.length === 0 && (
          <p className="text-amber-500 text-sm mt-1">
            Não há prioridades/origens cadastradas no sistema.
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="oQueSeraFeito"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          O que será feito (Descrição da Ação/Projeto):
        </label>
        <textarea
          id="oQueSeraFeito"
          value={oQueSeraFeito}
          onChange={(e) => setOQueSeraFeito(e.target.value)}
          rows={3}
          required
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label
          htmlFor="porQueSeraFeito"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Por que será feito (Justificativa da Ação/Projeto):
        </label>
        <textarea
          id="porQueSeraFeito"
          value={porQueSeraFeito}
          onChange={(e) => setPorQueSeraFeito(e.target.value)}
          rows={3}
          required
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label
          htmlFor="objetivosInstitucionaisReferenciados"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Objetivos Institucionais Referenciados:
        </label>
        <textarea
          id="objetivosInstitucionaisReferenciados"
          value={objetivosInstitucionaisReferenciados}
          onChange={(e) =>
            setObjetivosInstitucionaisReferenciados(e.target.value)
          }
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="obrigatorioInclusao"
              name="obrigatorioInclusao"
              type="checkbox"
              checked={obrigatorioInclusao}
              onChange={(e) => setObrigatorioInclusao(e.target.checked)}
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor="obrigatorioInclusao"
              className="font-medium text-gray-700"
            >
              Obrigatório Inclusão?
            </label>
            <p className="text-gray-500">
              Marque se a ação/projeto promove inclusão.
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="obrigatorioSustentabilidade"
              name="obrigatorioSustentabilidade"
              type="checkbox"
              checked={obrigatorioSustentabilidade}
              onChange={(e) => setObrigatorioSustentabilidade(e.target.checked)}
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor="obrigatorioSustentabilidade"
              className="font-medium text-gray-700"
            >
              Obrigatório Sustentabilidade?
            </label>
            <p className="text-gray-500">
              Marque se a ação/projeto promove sustentabilidade.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="dataInicio"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Data de Início Prevista:
          </label>
          <input
            type="date"
            id="dataInicio"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="dataFinal"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Data Final Prevista:
          </label>
          <input
            type="date"
            id="dataFinal"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="flex flex-col border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Pessoas Envolvidas no Projeto
        </h3>
        {pessoasProjeto.map((pessoa, index) => (
          <div
            key={pessoa.id}
            className="mb-4 p-4 border border-gray-200 rounded-md relative"
          >
            <button
              type="button"
              onClick={() => handleRemovePessoaProjeto(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              &times;
            </button>
            <h4 className="text-md font-medium text-gray-800 mb-2">
              {pessoa.papel === PapelProjeto.Responsavel
                ? "Responsável"
                : "Colaborador"}{" "}
              #
              {pessoasProjeto
                .filter((p) => p.papel === pessoa.papel)
                .findIndex((p) => p.id === pessoa.id) + 1}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor={`pessoaId-${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nome:
                </label>
                <select
                  id={`pessoaId-${index}`}
                  name="pessoaId"
                  value={pessoa.pessoaId}
                  onChange={(e) => handlePessoaProjetoChange(index, e)}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  disabled={loadingPessoas}
                >
                  <option value="">
                    {loadingPessoas
                      ? "Carregando pessoas..."
                      : "Selecione uma pessoa"}
                  </option>
                  {pessoas.map((p) => (
                    <option key={p.pessoa_id} value={p.pessoa_id.toString()}>
                      {p.nome} {p.tipo_usuario ? `(${p.tipo_usuario})` : ""}
                    </option>
                  ))}
                </select>
                {errorPessoas && (
                  <p className="text-red-500 text-sm mt-1">{errorPessoas}</p>
                )}
                {!loadingPessoas && pessoas.length === 0 && (
                  <p className="text-amber-500 text-sm mt-1">
                    Não há pessoas cadastradas.
                  </p>
                )}
              </div>
              {pessoa.papel === PapelProjeto.Colaborador && (
                <>
                  <div>
                    <label
                      htmlFor={`cargaHorariaSemanal-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Carga Horária Semanal (H):
                    </label>
                    <input
                      type="number"
                      id={`cargaHorariaSemanal-${index}`}
                      name="cargaHorariaSemanal"
                      value={pessoa.cargaHorariaSemanal || ""}
                      onChange={(e) => handlePessoaProjetoChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`tipoVinculoHae-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Tipo Vínculo HAE:
                    </label>
                    <select
                      id={`tipoVinculoHae-${index}`}
                      name="tipoVinculoHAE"
                      value={pessoa.tipoVinculoHAE || ""}
                      onChange={(e) => handlePessoaProjetoChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      disabled={loadingVinculos}
                    >
                      <option value="">
                        {loadingVinculos ? "Carregando tipos de vínculo..." : "Selecione o tipo"}
                      </option>
                      {tiposVinculoHAE.map((vinculo) => (
                        <option key={vinculo.id} value={vinculo.id.toString()}>
                          {vinculo.sigla} - {vinculo.descricao}
                        </option>
                      ))}
                      <option value="NaoSeAplica">Não se Aplica</option>
                    </select>
                    {errorVinculos && (
                      <p className="text-red-500 text-sm mt-1">{errorVinculos}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        <div className="flex justify-end space-x-2 mt-2">
          <button
            type="button"
            onClick={() => handleAddPessoaProjeto(PapelProjeto.Responsavel)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Adicionar Responsável
          </button>
          <button
            type="button"
            onClick={() => handleAddPessoaProjeto(PapelProjeto.Colaborador)}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Adicionar Colaborador
          </button>
        </div>
      </div>

      <div className="flex flex-col border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Etapas do Projeto/Processo
        </h3>
        {etapasProcesso.map((etapa, index) => (
          <div
            key={etapa.id}
            className="mb-4 p-4 border border-gray-200 rounded-md relative"
          >
            <button
              type="button"
              onClick={() => handleRemoveEtapaProcesso(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              &times;
            </button>
            <h4 className="text-md font-medium text-gray-800 mb-2">
              Etapa #{index + 1}
            </h4>
            <div className="mb-2">
              <label
                htmlFor={`etapa-descricao-${index}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descrição da Etapa:
              </label>
              <textarea
                id={`etapa-descricao-${index}`}
                name="descricao"
                value={etapa.descricao}
                onChange={(e) => handleEtapaProcessoChange(index, e)}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div>
                <label
                  htmlFor={`etapa-entregavelLinkSei-${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Entregável (link/SEI):
                </label>
                <select
                  id={`etapa-entregavelLinkSei-${index}`}
                  name="entregavelLinkSei"
                  value={etapa.entregavelLinkSei || ""}
                  onChange={(e) => handleEtapaProcessoChange(index, e)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  disabled={loadingEntregaveis}
                  // Remover o required
                >
                  <option value="">
                    {loadingEntregaveis 
                      ? "Carregando entregáveis..." 
                      : "Selecione um entregável (opcional)"}
                  </option>
                  {entregaveis.map((entregavel) => (
                    <option
                      key={entregavel.entregavel_id}
                      value={entregavel.entregavel_id.toString()}
                    >
                      {entregavel.entregavel_numero} - {entregavel.descricao}
                    </option>
                  ))}
                </select>
                {errorEntregaveis && (
                  <p className="text-red-500 text-sm mt-1">{errorEntregaveis}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor={`etapa-numeroRef-${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Número de Referência:
                </label>
                <input
                  type="text"
                  id={`etapa-numeroRef-${index}`}
                  name="numeroRef"
                  value={etapa.numeroRef || ""}
                  onChange={(e) => handleEtapaProcessoChange(index, e)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor={`etapa-dataVerificacaoPrevista-${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Data Verificação Prevista:
                </label>
                <input
                  type="date"
                  id={`etapa-dataVerificacaoPrevista-${index}`}
                  name="dataVerificacaoPrevista"
                  value={etapa.dataVerificacaoPrevista || ""}
                  onChange={(e) => handleEtapaProcessoChange(index, e)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label
                  htmlFor={`etapa-dataVerificacaoRealizada-${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Data Verificação Realizada:
                </label>
                <input
                  type="date"
                  id={`etapa-dataVerificacaoRealizada-${index}`}
                  name="dataVerificacaoRealizada"
                  value={etapa.dataVerificacaoRealizada || ""}
                  onChange={(e) => handleEtapaProcessoChange(index, e)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verificação:
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name={`verificacao-ok-${index}`}
                      checked={etapa.statusVerificacao === StatusVerificacao.OK}
                      onChange={() => {
                        const newStatus =
                          etapa.statusVerificacao === StatusVerificacao.OK
                            ? StatusVerificacao.Pendente
                            : StatusVerificacao.OK;
                        handleStatusChange(index, newStatus);
                      }}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">OK</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name={`verificacao-acao-${index}`}
                      checked={
                        etapa.statusVerificacao === StatusVerificacao.RequerAcao
                      }
                      onChange={() => {
                        const newStatus =
                          etapa.statusVerificacao ===
                          StatusVerificacao.RequerAcao
                            ? StatusVerificacao.Pendente
                            : StatusVerificacao.RequerAcao;
                        handleStatusChange(index, newStatus);
                      }}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Requer Ação
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddEtapaProcesso}
          className="self-end mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Adicionar Etapa
        </button>
      </div>

      <div className="flex flex-col border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Informações de Custos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="custoEstimado"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Custo Estimado (R$):
            </label>
            <input
              type="text"
              id="custoEstimado"
              value={custoEstimado}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, "");
                if (numericValue === "") {
                  setCustoEstimado("");
                } else {
                  const formattedValue = formatCurrency(numericValue);
                  setCustoEstimado(formattedValue);
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="R$ 0,00"
            />
          </div>
          <div>
            <label
              htmlFor="fonteRecursos"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fonte(s) dos Recursos:
            </label>
            <input
              type="text"
              id="fonteRecursos"
              value={fonteRecursos}
              onChange={(e) => setFonteRecursos(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: Orçamento Institucional, Projeto Específico, etc."
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Situação Problema / Oportunidade de Melhoria Associada
        </h3>
        {situacoesProblema.map((situacao, index) => (
          <div key={index} className="flex items-center mb-2">
            <select
              value={situacao.id}
              onChange={(e) => handleSituacaoProblemaChange(index, e)}
              className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mr-2 bg-white"
              disabled={loadingSituacoes}
            >
              <option value="">
                {loadingSituacoes ? "Carregando situações..." : "Selecionar situação problema..."}
              </option>
              {situacoesProblemaAPI.map((situacao) => (
                <option key={situacao.situacao_id} value={situacao.situacao_id.toString()}>
                  {situacao.codigo_categoria} - {situacao.descricao}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => handleRemoveSituacaoProblema(index)}
              className="px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
            >
              Remover
            </button>
          </div>
        ))}
        
        {errorSituacoes && (
          <p className="text-red-500 text-sm mt-1 mb-2">{errorSituacoes}</p>
        )}
        
        <button
          type="button"
          onClick={handleAddSituacaoProblema}
          className="mt-2 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 self-start"
        >
          Adicionar Situação
        </button>
      </div>
      
      <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
        <button
          type="submit"
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Registrar Ação/Projeto
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
