import api from "@lib/api";
import { API_ENDPOINTS } from "@lib/config";
import type { PgaComUnidade } from "@/types/api";

export type RegionalPgaStatus =
  | "EmElaboracao"
  | "Submetido"
  | "Aprovado"
  | "Reprovado";

export interface ReviewPgaPayload {
  status: Extract<RegionalPgaStatus, "Aprovado" | "Reprovado">;
  parecer?: string;
}

export const regionalService = {
  async listUnits(): Promise<any[]> {
    const { data } = await api.get(`${API_ENDPOINTS.REGIONAL}/unidades`);
    return data;
  },

  async listPgas(filters?: {
    status?: RegionalPgaStatus;
    unidadeId?: number;
  }): Promise<PgaComUnidade[]> {
    const params: Record<string, string | number> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.unidadeId) params.unidadeId = filters.unidadeId;
    const { data } = await api.get(`${API_ENDPOINTS.REGIONAL}/pgas`, {
      params,
    });
    return data;
  },

  async getPga(id: number): Promise<PgaComUnidade> {
    const { data } = await api.get(`${API_ENDPOINTS.REGIONAL}/pgas/${id}`);
    return data;
  },

  async reviewPga(
    id: number,
    payload: ReviewPgaPayload,
  ): Promise<PgaComUnidade> {
    const { data } = await api.patch(
      `${API_ENDPOINTS.REGIONAL}/pgas/${id}/avaliacao`,
      payload,
    );
    return data;
  },
};
