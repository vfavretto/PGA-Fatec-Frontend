import type { TipoUsuario } from "@/features/auth/services/authService";

type Role = TipoUsuario | string | undefined | null;

export const isAdministrador = (role: Role): boolean =>
  role === "Administrador";
export const isCps = (role: Role): boolean => role === "CPS";
export const isRegional = (role: Role): boolean => role === "Regional";
export const isDiretor = (role: Role): boolean => role === "Diretor";

export const isAdminOrCps = (role: Role): boolean =>
  isAdministrador(role) || isCps(role);

/** ADM/CPS podem gerenciar configurações do sistema (temas, eixos, prioridades, etc.) */
export const canManageSystemConfig = (role: Role): boolean =>
  isAdminOrCps(role);

/** ADM/CPS/Regional podem ver módulos de auditoria e histórico */
export const canViewAudit = (role: Role): boolean =>
  isAdminOrCps(role) || isRegional(role);

/** ADM/CPS/Regional podem aprovar/reprovar PGA */
export const canReviewPga = (role: Role): boolean =>
  isAdminOrCps(role) || isRegional(role);

/** Líder de unidade: ADM, CPS ou Diretor */
export const isUnitLead = (role: Role): boolean =>
  isAdminOrCps(role) || isDiretor(role);

/** Quem pode submeter PGA para análise regional */
export const canSubmitPga = (role: Role): boolean => isUnitLead(role);

/** Quem pode gerenciar pessoas (criar/editar/remover) dentro da unidade */
export const canManageUnitPeople = (role: Role): boolean => isUnitLead(role);

/** Quem pode editar projetos. Regional é apenas leitor/aprovador. */
export const canEditProjects = (role: Role): boolean => !isRegional(role);

/** Quem só enxerga o fluxo Regional (dashboard de aprovação) */
export const isRegionalOnly = (role: Role): boolean => isRegional(role);
