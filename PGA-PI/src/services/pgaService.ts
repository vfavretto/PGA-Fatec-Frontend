import api from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/config";
import type { PgaComUnidade } from "@/types/api";

class PgaService {
  async getAll(): Promise<PgaComUnidade[]> {
    try {
      const response = await api.get(API_ENDPOINTS.PGA);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar PGAs:", error);
      throw error;
    }
  }

  async getById(id: number): Promise<PgaComUnidade> {
    const { data } = await api.get(`${API_ENDPOINTS.PGA}/${id}`);
    return data;
  }

  /** Submete o PGA para análise regional (ADM/CPS/Diretor). */
  async submit(id: number): Promise<PgaComUnidade> {
    const { data } = await api.post(
      `${API_ENDPOINTS.PGA}/${id}/submeter`,
      {},
    );
    return data;
  }
}

export const pgaService = new PgaService();
