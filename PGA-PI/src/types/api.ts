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
    unidade: {
      unidade_id: number;
      codigo_fnnn: string;
      nome_completo: string;
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
    nome_completo: string;
    ativo: boolean;
  }>;
}

export interface EixoTematico {
  eixo_id: number;
  numero: number;
  nome: string;
  descricao?: string;
}

export interface PrioridadeAcao {
  prioridade_id: number;
  grau: number;
  descricao: string;
  tipo_gestao: string;
  detalhes?: string;
}

export interface Tema {
  tema_id: number;
  tema_num: number;
  eixo_id: number;
  descricao: string;
}

export interface ProjetoPessoa {
  projeto_pessoa_id?: number;
  pessoa_id: number;
  papel: 'Responsavel' | 'Colaborador';
  carga_horaria_semanal?: number;
  tipo_vinculo_hae_id?: number;
  pessoa: {
    pessoa_id: number;
    nome: string;
    email?: string;
    tipo_usuario?: string;
  };
}

export interface EtapaProjeto {
  etapa_id: number;
  descricao: string;
  data_verificacao_prevista?: string;
  data_verificacao_realizada?: string;
  status_verificacao?: 'Pendente' | 'OK' | 'RequerAcao';
  numero_ref?: string;
}

export enum StatusPGA {
  EmElaboracao = "EmElaboracao",
  Submetido = "Submetido",
  Aprovado = "Aprovado",
  Reprovado = "Reprovado",
}

export interface PgaComUnidade {
  pga_id: number;
  ano: number;
  unidade_id: number;
  status: StatusPGA | string;
  versao?: string;
  parecer_regional?: string | null;
  data_parecer_regional?: string | null;
  regional_responsavel_id?: number | null;
  unidade?: {
    unidade_id: number;
    codigo_fnnn: string;
    nome_completo: string;
    diretor_nome?: string;
  };
  regionalResponsavel?: {
    pessoa_id: number;
    nome: string;
    email?: string;
  } | null;
  usuarioCriacao?: {
    pessoa_id: number;
    nome: string;
  } | null;
}

export interface AcaoProjeto {
  acao_projeto_id: number;
  codigo_projeto?: string;
  nome_projeto?: string;
  pga_id: number;
  eixo_id: number;
  prioridade_id: number;
  tema_id: number;
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
  anexo_id: number;
  etapa_processo_id: number;
  entregavel_id?: number;
  item: string;
  descricao: string;
  quantidade: number;
  preco_unitario_estimado: number;
  preco_total_estimado: number;
  criado_em?: string;
  atualizado_em?: string;
}

export interface EntregavelLinkSei {
  entregavel_id: number;
  entregavel_numero: string;
  descricao: string;
  detalhes?: string;
}

export interface SituacaoProblema {
  situacao_id: number;
  codigo_categoria: string;
  descricao: string;
  fonte?: string | null;
  ordem?: number | null;
  ativo: boolean;
  criado_em: string;
  criado_por?: number | null;
  atualizado_em: string;
  atualizado_por?: number | null;
}

export interface TipoVinculoHAE {
  id: number;
  sigla: string;
  descricao: string;
  detalhes?: string;
}

export interface CreateAttachmentDto {
  etapa_processo_id: number;
  entregavel_id?: number;
  item: string;
  descricao: string;
  quantidade: number;
  preco_unitario_estimado: number;
  preco_total_estimado: number;
}

export interface UpdateAttachmentDto {
  etapa_processo_id?: number;
  entregavel_id?: number;
  item?: string;
  descricao?: string;
  quantidade?: number;
  preco_unitario_estimado?: number;
  preco_total_estimado?: number;
}

export interface CreateProject1Dto {
  pga_id: number;
  eixo_id: number;
  prioridade_id: number;
  tema_id: number;
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
}

export interface UpdateProject1Dto {
  pga_id?: number;
  eixo_id?: number;
  prioridade_id?: number;
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
  acao_projeto_id: number;
  descricao: string;
  entregavel_id?: number;
  numero_ref?: string;
  data_verificacao_prevista?: string;
  data_verificacao_realizada?: string;
  status_verificacao?: string;
}

export interface CreateProjetoPessoaDto {
  acao_projeto_id: number;
  pessoa_id: number;
  papel: string;
  carga_horaria_semanal?: number;
  tipo_vinculo_hae_id?: number;
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
    nome_completo: string;
    codigo_fnnn: string;
  };
  processador?: {
    pessoa_id: number;
    nome: string;
    email: string;
  };
}


