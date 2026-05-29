import { useEffect, useState } from 'react';
import { pgaService } from '@/services/pgaService';
import { projectService } from '@/features/projects/services/projectService';
import type { PgaComUnidade, AcaoProjeto } from '@/types/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  RefreshCw,
  Send,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';
import { STATUS_LABEL, STATUS_CLASS } from '../constants';
import { formatDate, daysLeft } from '../utils';
import { SubmitConfirmModal } from './SubmitConfirmModal';

export function DiretorPgaView() {
  const { toast } = useToast();
  const [pgas, setPgas] = useState<PgaComUnidade[]>([]);
  const [projetos, setProjetos] = useState<AcaoProjeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submitTarget, setSubmitTarget] = useState<PgaComUnidade | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [pgasData, projetosData] = await Promise.all([
        pgaService.getAll(),
        projectService.getAll(),
      ]);
      setPgas(pgasData.filter((p) => !p.is_template).sort((a, b) => b.ano - a.ano));
      setProjetos(projetosData);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível carregar os dados.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit() {
    if (!submitTarget) return;
    setSubmitting(true);
    try {
      await pgaService.submit(submitTarget.pga_id);
      toast({ title: 'PGA enviado!', description: 'O PGA foi submetido para avaliação da Regional com sucesso.' });
      setSubmitTarget(null);
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Não foi possível enviar o PGA.';
      toast({ title: 'Erro ao enviar', description: msg, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  function getProjetosByPga(pgaId: string) {
    return projetos.filter((p) => p.pga_id === pgaId);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus PGAs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Visualize, revise e envie o PGA da sua unidade para a Regional.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {loading ? (
        <div className="p-10 text-center text-gray-400">Carregando...</div>
      ) : pgas.length === 0 ? (
        <div className="p-10 text-center text-gray-400 text-sm">
          Nenhum PGA disponível para sua unidade ainda.
        </div>
      ) : (
        <div className="space-y-4">
          {pgas.map((pga) => {
            const projetosDoPga = getProjetosByPga(pga.pga_id);
            const isExpanded = expandedId === pga.pga_id;
            const dias = daysLeft(pga.data_limite_submissao);
            const podeEnviar = pga.status === 'EmElaboracao' || pga.status === 'Reprovado';

            return (
              <div key={pga.pga_id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {/* Cabeçalho do card */}
                <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-900">PGA {pga.ano}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASS[pga.status]}`}>
                          {STATUS_LABEL[pga.status]}
                        </span>
                      </div>
                      {pga.data_limite_submissao && (
                        <p className={`text-xs mt-1 flex items-center gap-1 ${
                          dias !== null && dias < 0 ? 'text-red-600 font-semibold' :
                          dias !== null && dias <= 7 ? 'text-amber-600' : 'text-gray-500'
                        }`}>
                          <Calendar className="h-3 w-3" />
                          Prazo: {formatDate(pga.data_limite_submissao)}
                          {dias !== null && (
                            <span className="ml-1">
                              {dias < 0 ? '(vencido)' : dias === 0 ? '(hoje)' : `(${dias}d restantes)`}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {podeEnviar && (
                      <Button
                        size="sm"
                        onClick={() => setSubmitTarget(pga)}
                        className="bg-[#ae0f0a] hover:bg-[#8e0c08] text-white gap-1"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {pga.status === 'Reprovado' ? 'Corrigir e Reenviar' : 'Enviar para Regional'}
                      </Button>
                    )}
                    {!podeEnviar && (
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${
                        pga.status === 'Submetido' ? 'bg-purple-50 text-purple-700' :
                        pga.status === 'Aprovado' ? 'bg-green-50 text-green-700' :
                        pga.status === 'Reprovado' ? 'bg-red-50 text-red-700' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {STATUS_LABEL[pga.status]}
                      </span>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setExpandedId(isExpanded ? null : pga.pga_id)}
                      className="gap-1"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {projetosDoPga.length} projeto(s)
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>

                {/* Parecer regional se reprovado ou aprovado com comentário */}
                {(pga.status === 'Reprovado' || pga.status === 'Aprovado') && pga.parecer_regional && (
                  <div className={`mx-6 mb-4 rounded-lg px-4 py-3 text-sm border ${
                    pga.status === 'Reprovado'
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-green-50 border-green-200 text-green-800'
                  }`}>
                    <p className="font-semibold mb-1">Parecer da Regional:</p>
                    <p>{pga.parecer_regional}</p>
                  </div>
                )}

                {/* Análise de cenário */}
                {pga.analise_cenario && (
                  <div className="mx-6 mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
                    <p className="font-semibold mb-1">Análise de Cenário:</p>
                    <p className="whitespace-pre-line">{pga.analise_cenario}</p>
                  </div>
                )}

                {/* Tabela de projetos (expansível) */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {projetosDoPga.length === 0 ? (
                      <div className="px-6 py-5 text-sm text-gray-400 text-center italic">
                        Nenhum projeto cadastrado neste PGA.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Código</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Projeto</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Eixo</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Início</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Término</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {projetosDoPga.map((proj) => (
                              <tr key={proj.acao_projeto_id} className="hover:bg-gray-50">
                                <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{proj.codigo_projeto ?? '—'}</td>
                                <td className="px-4 py-2.5 text-gray-800 max-w-xs">
                                  <p className="font-medium truncate">{proj.nome_projeto ?? '—'}</p>
                                  {proj.nome_projeto && (
                                    <p className="text-xs text-gray-400 truncate">{proj.o_que_sera_feito}</p>
                                  )}
                                </td>
                                <td className="px-4 py-2.5 text-gray-500 hidden md:table-cell">{proj.eixo?.nome_eixo ?? '—'}</td>
                                <td className="px-4 py-2.5 text-gray-500 hidden md:table-cell">{formatDate(proj.data_inicio?.toString())}</td>
                                <td className="px-4 py-2.5 text-gray-500 hidden md:table-cell">{formatDate(proj.data_final?.toString())}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <SubmitConfirmModal
        pga={submitTarget}
        onClose={() => setSubmitTarget(null)}
        onConfirm={handleSubmit}
        loading={submitting}
      />
    </div>
  );
}
