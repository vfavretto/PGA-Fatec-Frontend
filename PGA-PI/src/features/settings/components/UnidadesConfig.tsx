import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Loader2, Pencil, Trash2, AlertTriangle, Building2, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  unidadesService,
  type Regional,
  type Unidade,
  type CreateRegionalDto,
  type CreateUnidadeDto,
} from '../services/unidadesService';

type SubTab = 'regionais' | 'unidades';

export const UnidadesConfig = () => {
  const { toast } = useToast();
  const [subTab, setSubTab] = useState<SubTab>('regionais');

  // --- Regionais ---
  const [regionais, setRegionais] = useState<Regional[]>([]);
  const [loadingRegionais, setLoadingRegionais] = useState(true);
  const [searchRegional, setSearchRegional] = useState('');
  const [showAddRegional, setShowAddRegional] = useState(false);
  const [savingRegional, setSavingRegional] = useState(false);
  const [novaRegional, setNovaRegional] = useState<CreateRegionalDto>({ nome_regional: '', codigo_regional: '' });

  // --- Unidades ---
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loadingUnidades, setLoadingUnidades] = useState(true);
  const [searchUnidade, setSearchUnidade] = useState('');
  const [showAddUnidade, setShowAddUnidade] = useState(false);
  const [savingUnidade, setSavingUnidade] = useState(false);
  const [novaUnidade, setNovaUnidade] = useState<CreateUnidadeDto>({
    codigo_fnnn: '',
    nome_unidade: '',
    endereco: '',
    telefone: '',
    regional_id: '',
  });

  // Edição de unidade
  const [editingUnidade, setEditingUnidade] = useState<Unidade | null>(null);
  const [editUnidadeForm, setEditUnidadeForm] = useState<Partial<CreateUnidadeDto>>({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Exclusão de unidade
  const [deletingUnidade, setDeletingUnidade] = useState<Unidade | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    loadRegionais();
    loadUnidades();
  }, []);

  const loadRegionais = async () => {
    try {
      setLoadingRegionais(true);
      const data = await unidadesService.getAllRegionais();
      setRegionais(data);
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao carregar regionais' });
    } finally {
      setLoadingRegionais(false);
    }
  };

  const loadUnidades = async () => {
    try {
      setLoadingUnidades(true);
      const data = await unidadesService.getAllUnidades();
      setUnidades(data);
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao carregar unidades' });
    } finally {
      setLoadingUnidades(false);
    }
  };

  // --- Handlers Regionais ---
  const handleAddRegional = async () => {
    if (!novaRegional.nome_regional.trim()) {
      toast({ variant: 'destructive', title: 'Nome da regional é obrigatório' });
      return;
    }
    try {
      setSavingRegional(true);
      const criada = await unidadesService.createRegional(novaRegional);
      setRegionais(prev => [...prev, criada].sort((a, b) => a.nome_regional.localeCompare(b.nome_regional)));
      setNovaRegional({ nome_regional: '', codigo_regional: '' });
      setShowAddRegional(false);
      toast({ title: 'Regional criada com sucesso!' });
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao criar regional' });
    } finally {
      setSavingRegional(false);
    }
  };

  // --- Handlers Unidades ---
  const handleAddUnidade = async () => {
    if (!novaUnidade.codigo_fnnn.trim() || !novaUnidade.nome_unidade.trim() || !novaUnidade.regional_id) {
      toast({ variant: 'destructive', title: 'Código, nome e regional são obrigatórios' });
      return;
    }
    try {
      setSavingUnidade(true);
      const criada = await unidadesService.createUnidade(novaUnidade);
      setUnidades(prev => [...prev, criada].sort((a, b) => a.nome_unidade.localeCompare(b.nome_unidade)));
      setNovaUnidade({ codigo_fnnn: '', nome_unidade: '', endereco: '', telefone: '', regional_id: '' });
      setShowAddUnidade(false);
      toast({ title: 'Unidade criada com sucesso!' });
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao criar unidade' });
    } finally {
      setSavingUnidade(false);
    }
  };

  const handleEditUnidade = (u: Unidade) => {
    setEditingUnidade(u);
    setEditUnidadeForm({
      codigo_fnnn: u.codigo_fnnn,
      nome_unidade: u.nome_unidade,
      endereco: u.endereco ?? '',
      telefone: u.telefone ?? '',
      regional_id: u.regional_id,
    });
  };

  const handleSaveEditUnidade = async () => {
    if (!editingUnidade) return;
    try {
      setSavingEdit(true);
      const updated = await unidadesService.updateUnidade(editingUnidade.unidade_id, editUnidadeForm);
      setUnidades(prev => prev.map(u => u.unidade_id === updated.unidade_id ? updated : u));
      setEditingUnidade(null);
      toast({ title: 'Unidade atualizada com sucesso!' });
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao atualizar unidade' });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteUnidade = async () => {
    if (!deletingUnidade) return;
    try {
      setConfirmingDelete(true);
      await unidadesService.deleteUnidade(deletingUnidade.unidade_id);
      setUnidades(prev => prev.filter(u => u.unidade_id !== deletingUnidade.unidade_id));
      setDeletingUnidade(null);
      toast({ title: 'Unidade removida com sucesso!' });
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao remover unidade' });
    } finally {
      setConfirmingDelete(false);
    }
  };

  const filteredRegionais = regionais.filter(r =>
    r.nome_regional.toLowerCase().includes(searchRegional.toLowerCase()) ||
    (r.codigo_regional ?? '').toLowerCase().includes(searchRegional.toLowerCase()),
  );

  const filteredUnidades = unidades.filter(u =>
    u.nome_unidade.toLowerCase().includes(searchUnidade.toLowerCase()) ||
    u.codigo_fnnn.toLowerCase().includes(searchUnidade.toLowerCase()),
  );

  const getRegionalNome = (id: string) =>
    regionais.find(r => r.regional_id === id)?.nome_regional ?? id;

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setSubTab('regionais')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            subTab === 'regionais'
              ? 'border-[#ae0f0a] text-[#ae0f0a]'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <MapPin className="h-4 w-4" />
          Regionais
        </button>
        <button
          onClick={() => setSubTab('unidades')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            subTab === 'unidades'
              ? 'border-[#ae0f0a] text-[#ae0f0a]'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Unidades
        </button>
      </div>

      {/* ========== REGIONAIS ========== */}
      {subTab === 'regionais' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar regional..."
                value={searchRegional}
                onChange={e => setSearchRegional(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              onClick={() => setShowAddRegional(true)}
              className="bg-[#ae0f0a] hover:bg-[#8d0c08] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Regional
            </Button>
          </div>

      <Card className="overflow-hidden">
            {loadingRegionais ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#ae0f0a]" />
              </div>
            ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Responsável</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegionais.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                        Nenhuma regional encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegionais.map(r => (
                      <TableRow key={r.regional_id}>
                        <TableCell className="font-medium">{r.nome_regional}</TableCell>
                        <TableCell>
                          {r.codigo_regional
                            ? <Badge variant="outline">{r.codigo_regional}</Badge>
                            : <span className="text-gray-400 text-sm">—</span>
                          }
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {r.responsavel?.nome ?? <span className="text-gray-400">—</span>}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========== UNIDADES ========== */}
      {subTab === 'unidades' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar unidade..."
                value={searchUnidade}
                onChange={e => setSearchUnidade(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              onClick={() => setShowAddUnidade(true)}
              className="bg-[#ae0f0a] hover:bg-[#8d0c08] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Unidade
            </Button>
          </div>

          <Card className="overflow-hidden">
            {loadingUnidades ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#ae0f0a]" />
              </div>
            ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden sm:table-cell">Regional</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnidades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                        Nenhuma unidade encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUnidades.map(u => (
                      <TableRow key={u.unidade_id}>
                        <TableCell>
                          <Badge variant="outline">{u.codigo_fnnn}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>{u.nome_unidade}</div>
                          <div className="sm:hidden text-xs text-gray-500 mt-0.5">{getRegionalNome(u.regional_id)}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-gray-600">
                          {getRegionalNome(u.regional_id)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-500 hover:text-[#ae0f0a]"
                              onClick={() => handleEditUnidade(u)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                              onClick={() => setDeletingUnidade(u)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ===== Modal: Nova Regional ===== */}
      <Modal
        isOpen={showAddRegional}
        onClose={() => setShowAddRegional(false)}
        title="Nova Regional"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nome da Regional *</label>
            <Input
              value={novaRegional.nome_regional}
              onChange={e => setNovaRegional(prev => ({ ...prev, nome_regional: e.target.value }))}
              placeholder="Ex: Regional de São Paulo"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Código</label>
            <Input
              value={novaRegional.codigo_regional ?? ''}
              onChange={e => setNovaRegional(prev => ({ ...prev, codigo_regional: e.target.value }))}
              placeholder="Ex: RSP"
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowAddRegional(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddRegional}
              disabled={savingRegional}
              className="bg-[#ae0f0a] hover:bg-[#8d0c08] text-white"
            >
              {savingRegional && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===== Modal: Nova Unidade ===== */}
      <Modal
        isOpen={showAddUnidade}
        onClose={() => setShowAddUnidade(false)}
        title="Nova Unidade"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Código FNNN *</label>
              <Input
                value={novaUnidade.codigo_fnnn}
                onChange={e => setNovaUnidade(prev => ({ ...prev, codigo_fnnn: e.target.value }))}
                placeholder="Ex: F301"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Regional *</label>
              <Select
                value={novaUnidade.regional_id}
                onValueChange={val => setNovaUnidade(prev => ({ ...prev, regional_id: val }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {regionais.map(r => (
                    <SelectItem key={r.regional_id} value={r.regional_id}>
                      {r.nome_regional}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Nome da Unidade *</label>
            <Input
              value={novaUnidade.nome_unidade}
              onChange={e => setNovaUnidade(prev => ({ ...prev, nome_unidade: e.target.value }))}
              placeholder="Ex: Fatec São Paulo"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Endereço</label>
            <Input
              value={novaUnidade.endereco ?? ''}
              onChange={e => setNovaUnidade(prev => ({ ...prev, endereco: e.target.value }))}
              placeholder="Ex: Rua das Flores, 123 - Centro"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Telefone</label>
            <Input
              value={novaUnidade.telefone ?? ''}
              onChange={e => setNovaUnidade(prev => ({ ...prev, telefone: e.target.value }))}
              placeholder="Ex: (11) 1234-5678"
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowAddUnidade(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddUnidade}
              disabled={savingUnidade}
              className="bg-[#ae0f0a] hover:bg-[#8d0c08] text-white"
            >
              {savingUnidade && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===== Modal: Editar Unidade ===== */}
      <Modal
        isOpen={!!editingUnidade}
        onClose={() => setEditingUnidade(null)}
        title="Editar Unidade"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Código FNNN</label>
              <Input
                value={editUnidadeForm.codigo_fnnn ?? ''}
                onChange={e => setEditUnidadeForm(prev => ({ ...prev, codigo_fnnn: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Regional</label>
              <Select
                value={editUnidadeForm.regional_id ?? ''}
                onValueChange={val => setEditUnidadeForm(prev => ({ ...prev, regional_id: val }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {regionais.map(r => (
                    <SelectItem key={r.regional_id} value={r.regional_id}>
                      {r.nome_regional}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Nome da Unidade</label>
            <Input
              value={editUnidadeForm.nome_unidade ?? ''}
              onChange={e => setEditUnidadeForm(prev => ({ ...prev, nome_unidade: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Endereço</label>
            <Input
              value={editUnidadeForm.endereco ?? ''}
              onChange={e => setEditUnidadeForm(prev => ({ ...prev, endereco: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Telefone</label>
            <Input
              value={editUnidadeForm.telefone ?? ''}
              onChange={e => setEditUnidadeForm(prev => ({ ...prev, telefone: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditingUnidade(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEditUnidade}
              disabled={savingEdit}
              className="bg-[#ae0f0a] hover:bg-[#8d0c08] text-white"
            >
              {savingEdit && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===== Modal: Confirmar exclusão ===== */}
      <Modal
        isOpen={!!deletingUnidade}
        onClose={() => setDeletingUnidade(null)}
        title="Confirmar Exclusão"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Tem certeza que deseja remover esta unidade?</p>
              <p className="text-sm text-red-600 mt-1">{deletingUnidade?.nome_unidade} ({deletingUnidade?.codigo_fnnn})</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeletingUnidade(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteUnidade}
              disabled={confirmingDelete}
              variant="destructive"
            >
              {confirmingDelete && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Remover
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
