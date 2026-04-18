import api from "@lib/api";
import { API_ENDPOINTS } from "@lib/config";

export interface LoginCredentials {
  email: string;
  senha: string;
}

export type TipoUsuario =
  | "Administrador"
  | "CPS"
  | "Regional"
  | "Diretor"
  | "Coordenador"
  | "Administrativo"
  | "Docente";

export interface UnidadeVinculo {
  unidade_id: number;
  unidade?: {
    unidade_id: number;
    codigo_fnnn?: string;
    nome_completo?: string;
  };
}

export interface UserData {
  pessoa_id: number;
  email: string;
  nome: string;
  tipo_usuario?: TipoUsuario;
  unidades?: UnidadeVinculo[];
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  user?: UserData;
}

/** Função de autenticação */
export const authService = {
  /** Realiza o login do usuário
   * @param credentials - Objeto com email e senha
   * @returns Promise com os dados do usuário
   */
  async login(credentials: LoginCredentials): Promise<UserData> {
    try {
      const response = await api.post<LoginResponse>(
        API_ENDPOINTS.LOGIN,
        credentials
      );

      if (response.status !== 200) {
        throw new Error("Falha na autenticação");
      }

      const data: LoginResponse = response.data;
      const access_token: string = data.access_token;

      localStorage.setItem("accessToken", access_token);

      const parsed = parseJwt(access_token);

      let userData: UserData = {
        pessoa_id: parsed.pessoa_id,
        email: parsed.email,
        nome: parsed.nome,
        tipo_usuario: parsed.tipo_usuario,
      };

      // Buscar detalhes da pessoa (inclui vínculo de unidades) após login
      try {
        const detail = await api.get(`${API_ENDPOINTS.USERS}/${parsed.pessoa_id}`);
        const pessoa = detail.data ?? {};
        userData = {
          ...userData,
          nome: pessoa.nome ?? userData.nome,
          email: pessoa.email ?? userData.email,
          tipo_usuario: pessoa.tipo_usuario ?? userData.tipo_usuario,
          unidades: pessoa.unidades ?? [],
        };
      } catch (err) {
        // Se falhar, segue com os dados do JWT
        console.warn("Não foi possível carregar vínculos do usuário:", err);
      }

      localStorage.setItem("userData", JSON.stringify(userData));

      return userData;
    } catch (error) {
      console.error("Erro durante o login:", error);
      throw error;
    }
  },

  /** Logout do usuário
   * Remove o token de acesso e os dados do usuário do armazenamento local
   */
  logout(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
  },

  /** Verifica se o usuário está autenticado
   * @returns true se o usuário estiver autenticado, false caso contrário
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem("accessToken");
  },

  /** Retorna os dados do usuário atual
   * @returns Objeto com os dados do usuário ou null se não estiver autenticado
   */
  getCurrentUser(): UserData | null {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  },
};

interface JwtPayload {
  pessoa_id: number;
  email: string;
  nome: string;
  tipo_usuario?: TipoUsuario;
}

/** Função auxiliar para decodificar o token JWT
 * @param token - O token JWT a ser decodificado
 * @returns Objeto com os dados do usuário
 */
function parseJwt(token: string): JwtPayload {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Erro ao decodificar token JWT:", e);
    return { pessoa_id: 0, email: "", nome: "" };
  }
}
