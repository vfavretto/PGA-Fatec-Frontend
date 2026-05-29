import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Card, CardContent } from "@components/ui/card";
import api from "@lib/api";
import { logoImage, bgImage } from "@/assets";
import { ROUTES } from "@/utils/constants";

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const isFirstAccess = searchParams.get('firstAccess') === 'true';
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      await api.post(`/users/reset-password/confirm`, {
        token,
        password: formData.password
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao redefinir senha');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="fixed inset-0 z-0">
        <img
          className="w-full h-full object-cover"
          alt="Fatec Votorantim"
          src={bgImage}
        />
        <div className="absolute inset-0 backdrop-blur-[4px] bg-black/20"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-[644px] mx-auto">
          <img
            className="w-[324px] h-auto mx-auto mb-6"
            alt="Fatec Votorantim"
            src={logoImage}
          />

          <h1 className="font-['Source_Sans_3',Helvetica] font-extrabold text-white text-3xl md:text-4xl text-center mb-8 drop-shadow-lg">
            Plano de Gestão Anual - PGA
          </h1>

          <Card className="w-full bg-white/95 shadow-[0px_0px_25px_#00000055] rounded-[21px] backdrop-blur-sm">
            <CardContent className="p-6 md:p-10">
              <h2 className="font-['Source_Sans_3',Helvetica] font-extrabold text-[#2D3748] text-4xl md:text-5xl text-center mb-6">
                {isFirstAccess ? 'Definir Senha' : 'Redefinir Senha'}
              </h2>

              {isFirstAccess && !success && (
                <p className="text-center text-[#4A5568] text-base mb-4">
                  Seu cadastro foi aprovado! Defina sua senha para acessar o sistema.
                </p>
              )}

              {success ? (
                <div className="bg-green-100 text-green-700 p-4 rounded-lg text-center text-lg">
                  {isFirstAccess
                    ? 'Acesso liberado! Redirecionando para o login...'
                    : 'Senha alterada com sucesso! Redirecionando para o login...'}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 text-lg">
                      {error}
                    </div>
                  )}

                  <div className="mb-6">
                    <label
                      htmlFor="password"
                      className="block font-['Source_Sans_3',Helvetica] font-medium text-[#2D3748] text-lg md:text-xl mb-2"
                    >
                      Nova Senha
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Digite sua nova senha"
                      className="h-[59px] text-lg md:text-xl font-['Source_Sans_3',Helvetica] text-[#4A5568] bg-white rounded-lg border-[#E2E8F0] focus:border-[#ae0f0a] focus:ring-[#ae0f0a]"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="confirmPassword"
                      className="block font-['Source_Sans_3',Helvetica] font-medium text-[#2D3748] text-lg md:text-xl mb-2"
                    >
                      Confirme a Nova Senha
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      placeholder="Confirme sua nova senha"
                      className="h-[59px] text-lg md:text-xl font-['Source_Sans_3',Helvetica] text-[#4A5568] bg-white rounded-lg border-[#E2E8F0] focus:border-[#ae0f0a] focus:ring-[#ae0f0a]"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-[57px] bg-[#ae0f0a] hover:bg-[#8e0c08] rounded-lg font-['Source_Sans_3',Helvetica] font-extrabold text-white text-xl md:text-2xl transition-colors duration-200"
                  >
                    {isLoading
                      ? (isFirstAccess ? 'Definindo...' : 'Alterando...')
                      : (isFirstAccess ? 'Definir Senha e Acessar' : 'Alterar Senha')}
                  </Button>

                  <div className="mt-6 text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => navigate(ROUTES.LOGIN)}
                      className="font-['Source_Sans_3',Helvetica] text-[#ae0f0a] hover:text-[#8e0c08] text-base md:text-lg"
                    >
                      Voltar para o login
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};