import { useAuth } from "@/context/AuthContext";
import {
  canEditProjects,
  canManageSystemConfig,
  canManageUnitPeople,
  canReviewPga,
  canSubmitPga,
  canViewAudit,
  isAdminOrCps,
  isAdministrador,
  isCps,
  isDiretor,
  isRegional,
  isRegionalOnly,
  isUnitLead,
} from "@/lib/permissions";

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.tipo_usuario;
  const unidadeId = user?.unidades?.[0]?.unidade_id;

  return {
    role,
    unidadeId,
    isAdministrador: isAdministrador(role),
    isCps: isCps(role),
    isRegional: isRegional(role),
    isDiretor: isDiretor(role),
    isAdminOrCps: isAdminOrCps(role),
    isUnitLead: isUnitLead(role),
    isRegionalOnly: isRegionalOnly(role),
    canManageSystemConfig: canManageSystemConfig(role),
    canViewAudit: canViewAudit(role),
    canReviewPga: canReviewPga(role),
    canSubmitPga: canSubmitPga(role),
    canManageUnitPeople: canManageUnitPeople(role),
    canEditProjects: canEditProjects(role),
  };
}
