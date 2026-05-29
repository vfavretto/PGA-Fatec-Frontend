// Enums do backend
export enum TipoUsuario {
  ADMINISTRADOR = "Administrador",
  CPS = "CPS",
  REGIONAL = "Regional",
  DIRETOR = "Diretor",
  COORDENADOR = "Coordenador",
  ADMINISTRATIVO = "Administrativo",
  DOCENTE = "Docente",
}

export enum AnexoProjetoUm {
  ANEXO1 = "1",
  ANEXO2 = "2",
  ANEXO3 = "3",
  ANEXO4 = "4",
}

export enum StatusVerificacao {
  PENDENTE = "Pendente",
  OK = "OK",
  REQUER_ACAO = "RequerAcao",
}

export enum CargoUnidade {
  AssessorIV = "AssessorIV",
  ChefeServicoAdministrativo = "ChefeServicoAdministrativo",
  ChefeServicoAcademico = "ChefeServicoAcademico",
  AssistenteTecnico = "AssistenteTecnico",
  PsicologoInstitucional = "PsicologoInstitucional",
  AgenteFacilitadorInova = "AgenteFacilitadorInova",
}

export const CARGO_UNIDADE_LABELS: Record<CargoUnidade, string> = {
  [CargoUnidade.AssessorIV]: 'Assessor IV – Vice-Diretor(a)',
  [CargoUnidade.ChefeServicoAdministrativo]: 'Chefe de Serviço Área Administrativa',
  [CargoUnidade.ChefeServicoAcademico]: 'Chefe de Serviço Área Acadêmica',
  [CargoUnidade.AssistenteTecnico]: 'Assistente Técnico – AT',
  [CargoUnidade.PsicologoInstitucional]: 'Psicólogo Institucional – PNE',
  [CargoUnidade.AgenteFacilitadorInova]: 'Agente Facilitador Local do INOVA CPS',
};

export interface User {
  pessoa_id: number;
  nome: string;
  email?: string;
  nome_usuario?: string;
  tipo_usuario: TipoUsuario;
  ativo?: boolean;
  unidade_id?: number;
  createdAt?: Date;
  unidades?: Array<{
    pessoa_id: number;
    unidade_id: number;
    data_vinculo: string;
    ativo: boolean;
    cargo?: CargoUnidade | null;
    unidade: {
      unidade_id: number;
      codigo_fnnn: string;
      nome_unidade: string;
      diretor_nome?: string;
    }
  }>;
}

export interface Pessoa {
  pessoa_id: number;
  nome: string;
  email: string;
  tipo_usuario: TipoUsuario;
  ativo: boolean;
  criado_em?: string;
  unidades?: Array<{
    unidade_id: number;
    nome_unidade: string;
    ativo: boolean;
  }>;
}

export interface EixoTematico {
  eixo_id: string;
  numero: number;
  nome_eixo: string;
  descricao?: string;
}

export interface PrioridadeAcao {
  prioridade_id: string;
  grau: number;
  descricao: string;
  tipo_gestao: string;
  detalhes?: string;
}

export interface Tema {
  tema_id: string;
  tema_num: number;
  eixo_id: string;
  descricao: string;
}

export interface ProjetoPessoa {
  projeto_pessoa_id?: string;
  pessoa_id: string;
  papel: 'Responsavel' | 'Colaborador';
  carga_horaria_semanal?: number;
  tipo_vinculo_hae_id?: string;
  pessoa: {
    pessoa_id: string;
    nome: string;
    email?: string;
    tipo_usuario?: string;
  };
}

export interface EtapaProjeto {
  etapa_id: string;
  descricao: string;
  data_verificacao_prevista?: string;
  data_verificacao_realizada?: string;
  status_verificacao?: 'Pendente' | 'OK' | 'RequerAcao';
  numero_ref?: string;
}

export type StatusPGA =
  | 'EmElaboracao'
  | 'Publicado'
  | 'Submetido'
  | 'Aprovado'
  | 'AguardandoCPS'
  | 'AprovadoCPS'
  | 'Reprovado';

export interface PgaComUnidade {
  pga_id: string;
  ano: number;
  unidade_id: string | null;
  status: StatusPGA;
  versao?: string;
  is_template: boolean;
  template_pga_id?: string | null;
  data_limite_submissao?: string | null;
  analise_cenario?: string | null;
  parecer_regional?: string | null;
  parecer_cps?: string | null;
  copias?: Array<{ pga_id: string; unidade_id: string; status: StatusPGA }>;
  unidade?: {
    unidade_id: string;
    codigo_fnnn: string;
    nome_unidade: string;
    diretor?: { nome: string } | null;
  };
}

export interface PublishPgaResult {
  template_pga_id: string;
  ano: number;
  copias_geradas: number;
  unidades: Array<{ pga_id: string; unidade_id: string }>;
}

export interface AcaoProjeto {
  acao_projeto_id: string;
  codigo_projeto?: string;
  nome_projeto?: string;
  pga_id: string;
  eixo_id: string;
  prioridade_id: string;
  tema_id: string;
  o_que_sera_feito: string;
  por_que_sera_feito: string;
  data_inicio?: Date | null;
  data_final?: Date | null;
  objetivos_institucionais_referenciados?: string | null;
  obrigatorio_inclusao: boolean;
  obrigatorio_sustentabilidade: boolean;
  ativo: boolean;
  custo_total_estimado?: number | null;
  fonte_recursos?: string | null;

  eixo?: EixoTematico;
  tema?: Tema;
  pga?: PgaComUnidade;
  prioridade?: PrioridadeAcao;
  situacoesProblemas?: SituacaoProblema[];
  etapas?: EtapaProjeto[];
  pessoas?: ProjetoPessoa[];
}

export interface Attachment {
  anexo_id: string;
  etapa_processo_id: string;
  entregavel_id?: string;
  item: string;
  descricao: string;
  quantidade: number;
  preco_unitario_estimado: number;
  preco_total_estimado: number;
  criado_em?: string;
  atualizado_em?: string;
}

export interface EntregavelLinkSei {
  entregavel_id: string;
  entregavel_numero: string;
  descricao: string;
  detalhes?: string;
}

export interface SituacaoProblema {
  situacao_id: string;
  codigo_categoria: string;
  descricao: string;
  fonte?: string | null;
  ordem?: number | null;
  ativo: boolean;
  criado_em: string;
  criado_por?: string | null;
  atualizado_em: string;
  atualizado_por?: string | null;
}

export interface TipoVinculoHAE {
  id: string;
  sigla: string;
  descricao: string;
  detalhes?: string;
}

export interface CreateAttachmentDto {
  etapa_processo_id: string;
  entregavel_id: string;
  item: string;
  descricao: string;
  quantidade: number;
  preco_unitario_estimado: number;
  preco_total_estimado: number;
}

export interface UpdateAttachmentDto {
  etapa_processo_id?: string;
  entregavel_id?: string;
  item?: string;
  descricao?: string;
  quantidade?: number;
  preco_unitario_estimado?: number;
  preco_total_estimado?: number;
}

export interface CreateProject1Dto {
  pga_id: string;
  eixo_id: string;
  prioridade_id: string;
  tema_id: string;
  o_que_sera_feito: string;
  por_que_sera_feito: string;
  data_inicio?: string | Date | null;
  data_final?: string | Date | null;
  objetivos_institucionais_referenciados?: string | null;
  obrigatorio_inclusao?: boolean;
  obrigatorio_sustentabilidade?: boolean;
  nome_projeto?: string;
  codigo_projeto?: string;
  custo_total_estimado?: number;
  fonte_recursos?: string;
  situacao_problema_ids?: string[];
}

export interface UpdateProject1Dto {
  pga_id?: string;
  eixo_id?: string;
  prioridade_id?: string;
  tema?: string;
  o_que_sera_feito?: string;
  por_que_sera_feito?: string;
  data_inicio?: string;
  data_final?: string;
  objetivos_institucionais_referenciados?: string;
  obrigatorio_inclusao?: boolean;
  obrigatorio_sustentabilidade?: boolean;
}

export interface CreateProcessStepDto {
  acao_projeto_id: string;
  descricao: string;
  entregavel_id?: string;
  numero_ref?: string;
  data_verificacao_prevista?: string;
  data_verificacao_realizada?: string;
  status_verificacao?: string;
}

export interface CreateProjetoPessoaDto {
  acao_projeto_id: string;
  pessoa_id: string;
  papel: string;
  carga_horaria_semanal?: number;
  tipo_vinculo_hae_id?: string;
}

// Tipos de resposta da API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Adicione esta interface se ainda não existir

export interface SolicitacaoAcesso {
  solicitacao_id: number;
  nome: string;
  email: string;
  unidade_id: number;
  status: 'Pendente' | 'Aprovada' | 'Rejeitada';
  data_solicitacao: string;
  data_processamento?: string | null;
  processado_por?: number | null;
  tipo_usuario_concedido?: string | null;
  unidade?: {
    unidade_id: number;
    nome_unidade: string;
    codigo_fnnn: string;
  };
  processador?: {
    pessoa_id: number;
    nome: string;
    email: string;
  };
}


