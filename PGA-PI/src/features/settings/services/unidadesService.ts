import api from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/config';

export interface Regional {
  regional_id: string;
  nome_regional: string;
  codigo_regional?: string;
  responsavel_id?: string;
  responsavel?: {
    pessoa_id: number;
    nome: string;
    email: string;
  };
}

export interface Unidade {
  unidade_id: string;
  codigo_fnnn: string;
  nome_unidade: string;
  endereco?: string;
  telefone?: string;
  regional_id: string;
  diretor_id?: string;
}

export interface CreateRegionalDto {
  nome_regional: string;
  codigo_regional?: string;
  responsavel_id?: string;
}

export interface CreateUnidadeDto {
  codigo_fnnn: string;
  nome_unidade: string;
  endereco?: string;
  telefone?: string;
  regional_id: string;
  diretor_id?: string;
}

export interface UpdateUnidadeDto {
  codigo_fnnn?: string;
  nome_unidade?: string;
  endereco?: string;
  telefone?: string;
  regional_id?: string;
  diretor_id?: string;
}

class UnidadesService {
  // Regionais
  async getAllRegionais(): Promise<Regional[]> {
    const response = await api.get<Regional[]>(API_ENDPOINTS.REGIONALS);
    return response.data;
  }

  async createRegional(data: CreateRegionalDto): Promise<Regional> {
    const response = await api.post<Regional>(API_ENDPOINTS.REGIONALS, data);
    return response.data;
  }

  // Unidades
  async getAllUnidades(): Promise<Unidade[]> {
    const response = await api.get<Unidade[]>(API_ENDPOINTS.UNITS);
    return response.data;
  }

  async createUnidade(data: CreateUnidadeDto): Promise<Unidade> {
    const response = await api.post<Unidade>(API_ENDPOINTS.UNITS, data);
    return response.data;
  }

  async updateUnidade(id: string, data: UpdateUnidadeDto): Promise<Unidade> {
    const response = await api.put<Unidade>(`${API_ENDPOINTS.UNITS}/${id}`, data);
    return response.data;
  }

  async deleteUnidade(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.UNITS}/${id}`);
  }

  async getUnidadesByRegional(regionalId: string): Promise<Unidade[]> {
    const response = await api.get<Unidade[]>(
      `${API_ENDPOINTS.REGIONAL_UNIDADES}?regional_id=${regionalId}`,
    );
    return response.data;
  }
}

export const unidadesService = new UnidadesService();
