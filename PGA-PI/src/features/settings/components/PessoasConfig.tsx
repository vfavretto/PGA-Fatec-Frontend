import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, AlertCircle, UserPlus, UserRound, InboxIcon, Users, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { PendingAccessRequestsTab } from "./PendingAccessRequests";
import { CargoUnidade, CARGO_UNIDADE_LABELS, TipoUsuario, User } from "@/types/api";
import { accessRequestService, userService, type CreateUserData, type UpdateUserData } from "@/services/commonServices";
import api from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/config';
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

export const PessoasConfig: React.FC = () => {
  const { user } = useAuth();
  
  const [pessoas, setPessoas] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [novaPessoa, setNovaPessoa] = useState<CreateUserData>({ 
    nome: "", 
    email: "", 
    tipo_usuario: TipoUsuario.DOCENTE,
    unidade_id: undefined
  });

  const [regionais, setRegionais] = useState<any[]>([]);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [fetchedUserDetails, setFetchedUserDetails] = useState<any>(null);
  const [selectedRegionalId, setSelectedRegionalId] = useState<string | undefined>(undefined);
  const [selectedUnidadeId, setSelectedUnidadeId] = useState<string | undefined>(undefined);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnidadeId, setFilterUnidadeId] = useState<string | undefined>(undefined);
  const [filterRegionalId, setFilterRegionalId] = useState<string | undefined>(undefined);
  const [filterUnidades, setFilterUnidades] = useState<any[]>([]);
  const [filterOnlyCPS, setFilterOnlyCPS] = useState(false);
  const [showAccessRequests, setShowAccessRequests] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Estado para edição
  const [editingPessoa, setEditingPessoa] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<{ nome: string; tipo_usuario: TipoUsuario; ativo: boolean; cargo: CargoUnidade | null }>({
    nome: '',
    tipo_usuario: TipoUsuario.DOCENTE,
    ativo: true,
    cargo: null,
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const unidadeId = (user as any)?.unidades?.[0]?.unidade_id;

  useEffect(() => {
    if (!user) return;
    const first = (user as any)?.unidades?.[0];
    if (!first) return;

    const resolvedUnidadeId = first.unidade_id ?? first.unidade?.unidade_id ?? first.unidade?.id ?? first.unidade?.id_unidade;
    const resolvedRegionalId = first.unidade?.regional_id ?? first.regional_id ?? first.unidade?.regional?.regional_id ?? first.regional?.id;

    if (resolvedUnidadeId) setSelectedUnidadeId(String(resolvedUnidadeId));
    if (resolvedRegionalId) setSelectedRegionalId(String(resolvedRegionalId));
  }, [user]);

  /** Shared helper: fetch and deduplicate users from a list of unit objects */
  const fetchPessoasDeUnidades = useCallback(async (units: any[]): Promise<User[]> => {
    const results = await Promise.allSettled(
      units.map((u: any) =>
        api.get(`${API_ENDPOINTS.USERS_BY_UNIDADE}/${u.unidade_id ?? u.id}`).then(r => r.data as User[])
      )
    );
    let data: User[] = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
    const seen = new Set<string>();
    data = data.filter(p => {
      const key = (p as any).pessoa_id as string;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return data;
  }, []);

  const loadPessoas = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      let pessoasData: User[] = [];

      const userTipo = (user as any)?.tipo_usuario || (user as any)?.tipoUsuario;

      if (userTipo === TipoUsuario.ADMINISTRADOR || userTipo === TipoUsuario.CPS) {
        pessoasData = await userService.getAll();
      } else if (userTipo === TipoUsuario.REGIONAL) {
        // Load people from all units of the regional
        let unitList = unidades.length > 0 ? unidades : [];
        if (unitList.length === 0 && selectedRegionalId) {
          const resp = await api.get(API_ENDPOINTS.REGIONAL_UNIDADES, { params: { regional_id: selectedRegionalId } });
          unitList = Array.isArray(resp.data) ? resp.data : [];
        }
        pessoasData = await fetchPessoasDeUnidades(unitList);
      } else {
        const unidadeFromAuth = (user as any)?.unidades?.[0]?.unidade_id ?? (user as any)?.unidades?.[0]?.unidade?.unidade_id;
        const unidadeFromFetched = fetchedUserDetails?.unidades?.[0]?.unidade_id ?? fetchedUserDetails?.unidades?.[0]?.unidade?.unidade_id;
        const unidadeFromContexts = unidades?.[0]?.unidade_id ?? unidades?.[0]?.id ?? unidades?.[0]?.unidade?.unidade_id;
        const unidadeToUse = selectedUnidadeId || unidadeFromFetched || unidadeFromContexts || unidadeFromAuth;

        if (!unidadeToUse) {
          pessoasData = [];
        } else {
          pessoasData = await userService.getByUnidade(unidadeToUse);
        }
      }

      setPessoas(pessoasData);
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar a lista de pessoas"
      });
      
      setPessoas([]);
    } finally {
      setLoading(false);
    }
  }, [user, selectedUnidadeId, fetchedUserDetails, fetchPessoasDeUnidades]);

  useEffect(() => {
    if (!selectedUnidadeId) return;
    const userTipoLocal = (user as any)?.tipo_usuario || (user as any)?.tipoUsuario;
    if (userTipoLocal === TipoUsuario.ADMINISTRADOR || userTipoLocal === TipoUsuario.CPS || userTipoLocal === TipoUsuario.REGIONAL) return;
    fetchPessoasForUnit(selectedUnidadeId);
  }, [selectedUnidadeId]);

  const fetchPessoasForUnit = async (unidadeNum?: string) => {
    setLoading(true);
    try {
      if (!unidadeNum) {
        console.warn('fetchPessoasForUnit chamado sem unidadeId');
        setPessoas([]);
        return;
      }

      const resp = await userService.getByUnidade(unidadeNum);
      setPessoas(resp || []);
    } catch (err) {
      console.error('Erro ao buscar pessoas por unidade (direct):', err);
      setPessoas([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAccessRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const data = await accessRequestService.getAll();

      const pendingCount = data.pendingRequests?.length || 0;
      setPendingRequestsCount(pendingCount);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
      setPendingRequestsCount(0);
    } finally {
      setLoadingRequests(false);
    }
  }, []);
  const initRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    const initRan = initRef.current;
    if (initRan) return;
    initRef.current = true;

    const init = async () => {
      try {
        const userTipoInit = (user as any)?.tipo_usuario || (user as any)?.tipoUsuario;

        // For Regional users: resolve regional_id from backend (active_context.id = pessoa_id, not regional_id)
        if (userTipoInit === TipoUsuario.REGIONAL) {
          try {
            // GET /regional/unidades (sem params) retorna { regional_id, nome_regional, unidades[] } para o usuário autenticado
            const resp = await api.get(API_ENDPOINTS.REGIONAL_UNIDADES);
            const data = resp.data;
            const regionalId: string | undefined = data?.regional_id;
            const regionalNome: string = data?.nome_regional ?? data?.nome ?? '';
            const units: any[] = Array.isArray(data?.unidades) ? data.unidades : [];
            if (regionalId) {
              setRegionais([{ regional_id: regionalId, nome: regionalNome }]);
              setSelectedRegionalId(regionalId);
              setUnidades(units);
            }
            // Carrega pessoas de todas as unidades diretamente (state pode ainda não ter atualizado)
            if (units.length > 0) {
              setLoading(true);
              try {
                const pessoasData = await fetchPessoasDeUnidades(units);
                setPessoas(pessoasData);
              } catch (err) {
                console.error('[PessoasConfig] erro ao carregar pessoas da regional:', err);
                setPessoas([]);
              } finally {
                setLoading(false);
              }
            }
          } catch (err) {
            console.error('[PessoasConfig] erro ao buscar regional do usuário:', err);
          }
          // REGIONAL não tem acesso a loadAccessRequests
          return;
        }

        await carregarContexts();

        const hasUnitsInAuth = Array.isArray((user as any)?.unidades) && (user as any).unidades.length > 0;
        if (!hasUnitsInAuth && (user as any)?.pessoa_id) {
          try {
            const resp = await api.get(`${API_ENDPOINTS.USERS}/${(user as any).pessoa_id}`);
            setFetchedUserDetails(resp.data);

            const first = resp.data?.unidades?.[0];
            const resolvedUnidadeId = first?.unidade_id ?? first?.unidade?.unidade_id ?? first?.unidade?.id;
            const resolvedRegionalId = first?.unidade?.regional_id ?? first?.regional_id ?? first?.unidade?.regional?.regional_id ?? first?.regional?.id;
            if (resolvedUnidadeId) setSelectedUnidadeId(String(resolvedUnidadeId));
            if (resolvedRegionalId) setSelectedRegionalId(String(resolvedRegionalId));
          } catch (err) {
            console.debug('Não foi possível buscar detalhes completos do usuário:', err);
          }
        }

        const unidadeFromAuth = (user as any)?.unidades?.[0]?.unidade_id ?? (user as any)?.unidades?.[0]?.unidade?.unidade_id;
        const unidadeFromFetched = fetchedUserDetails?.unidades?.[0]?.unidade_id ?? fetchedUserDetails?.unidades?.[0]?.unidade?.unidade_id;
        const unidadeFromContexts = unidades?.[0]?.unidade_id ?? unidades?.[0]?.id ?? unidades?.[0]?.unidade?.unidade_id;
        const unidadeResolved = selectedUnidadeId || unidadeFromFetched || unidadeFromContexts || unidadeFromAuth;

        if (unidadeResolved) {
          await fetchPessoasForUnit(unidadeResolved as number);
        } else {
          await loadPessoas();
        }

        await loadAccessRequests();
      } catch (err) {
        console.error('Erro durante inicialização de usuário:', err);
      }
    };

    init();
  }, [user && (user as any)?.pessoa_id]);

  const carregarContexts = async () => {
    try {
      const userTipoLocal = (user as any)?.tipo_usuario || (user as any)?.tipoUsuario;

      if (userTipoLocal === TipoUsuario.ADMINISTRADOR || userTipoLocal === TipoUsuario.CPS || userTipoLocal === TipoUsuario.REGIONAL) {
        const respRegionais = await api.get(API_ENDPOINTS.REGIONALS);
        const regionaisData = respRegionais.data || [];
        setRegionais(Array.isArray(regionaisData) ? regionaisData : []);
      } else {
        setRegionais([]);
      }

      const respContexts = await api.get(API_ENDPOINTS.CONTEXTS);
      const data = respContexts.data || {};
      const loadedUnidades = Array.isArray(data.unidades) ? data.unidades : [];
      if (!selectedUnidadeId && fetchedUserDetails?.unidades?.length) {
        const first = fetchedUserDetails.unidades[0];
        const uid = first.unidade_id || first.unidade?.unidade_id || first.unidade?.id;
        if (uid) setSelectedUnidadeId(String(uid));
      }
      if (!selectedUnidadeId && loadedUnidades.length) {
        setSelectedUnidadeId(loadedUnidades[0].unidade_id || loadedUnidades[0].id);
      }
      setUnidades(loadedUnidades);
    } catch (error) {
      console.error('Erro ao carregar regionais/unidades:', error);
      setRegionais([]);
      setUnidades([]);
    }
  };

  useEffect(() => {
    const loadUnidadesPorRegional = async (regionalId?: string) => {
      const userTipoLocal = (user as any)?.tipo_usuario || (user as any)?.tipoUsuario;
      // REGIONAL: unidades já carregadas no init, não sobrescrever
      if (userTipoLocal === TipoUsuario.REGIONAL) return;

      if (!regionalId) {
        setUnidades([]);
        return;
      }

      try {
        if (userTipoLocal === TipoUsuario.ADMINISTRADOR || userTipoLocal === TipoUsuario.CPS) {
          const resp = await api.get(API_ENDPOINTS.REGIONAL_UNIDADES, { params: { regional_id: regionalId } });
          setUnidades(Array.isArray(resp.data) ? resp.data : []);
        } else {
          const first = fetchedUserDetails?.unidades?.[0] || (user as any)?.unidades?.[0];
          if (first) {
            const unidadeObj = first.unidade || first;
            setUnidades([unidadeObj]);
          } else {
            setUnidades([]);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar unidades por regional:', error);
        setUnidades([]);
      }
    };

    loadUnidadesPorRegional(selectedRegionalId);
  }, [selectedRegionalId]);

  // Carrega unidades para os filtros de exibição (CPS/Admin)
  useEffect(() => {
    if (!filterRegionalId) {
      setFilterUnidades([]);
      setFilterUnidadeId(undefined);
      return;
    }
    api.get(API_ENDPOINTS.REGIONAL_UNIDADES, { params: { regional_id: filterRegionalId } })
      .then(r => setFilterUnidades(Array.isArray(r.data) ? r.data : []))
      .catch(() => setFilterUnidades([]));
  }, [filterRegionalId]);

  const handleAddPessoa = async () => {
    if (!novaPessoa.nome || !novaPessoa.email) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha o nome e o email"
      });
      return;
    }

    if (!novaPessoa.email.includes("@")) {
      toast({
        variant: "destructive",
        title: "Email inválido",
        description: "Por favor, insira um email válido"
      });
      return;
    }

    setLoading(true);
    try {
      const tipo = novaPessoa.tipo_usuario as TipoUsuario;

      if (tipo === TipoUsuario.REGIONAL) {
        if (!selectedRegionalId) {
          toast({ variant: 'destructive', title: 'Campo obrigatório', description: 'Selecione a regional para o tipo Regional' });
          setLoading(false);
          return;
        }
      } else if (tipo !== TipoUsuario.ADMINISTRADOR && tipo !== TipoUsuario.CPS) {
        if (!selectedRegionalId) {
          toast({ variant: 'destructive', title: 'Campo obrigatório', description: 'Selecione a regional' });
          setLoading(false);
          return;
        }
        if (!selectedUnidadeId) {
          toast({ variant: 'destructive', title: 'Campo obrigatório', description: 'Selecione a unidade' });
          setLoading(false);
          return;
        }
      }

      const dadosPessoa: any = {
        ...novaPessoa,
      };

      const unitRoles = [
        TipoUsuario.DIRETOR,
        TipoUsuario.COORDENADOR,
        TipoUsuario.ADMINISTRATIVO,
        TipoUsuario.DOCENTE,
      ];

      const isUnitRole = unitRoles.includes(tipo as TipoUsuario);

      if (tipo === TipoUsuario.REGIONAL) {
        dadosPessoa.regional_id = selectedRegionalId || novaPessoa.regional_id || fetchedUserDetails?.unidades?.[0]?.regional_id;
        delete dadosPessoa.unidade_id;
      } else if (isUnitRole) {
        const unidadeToSend = selectedUnidadeId || novaPessoa.unidade_id || fetchedUserDetails?.unidades?.[0]?.unidade_id || unidadeId;
        const regionalToSend = selectedRegionalId || novaPessoa.regional_id || fetchedUserDetails?.unidades?.[0]?.regional_id;
        dadosPessoa.unidade_id = unidadeToSend;
        dadosPessoa.regional_id = regionalToSend;
      } else {
        delete dadosPessoa.unidade_id;
      }

      const novaPessoaCriada = await userService.create(dadosPessoa);
      
      setPessoas(prev => [...prev, novaPessoaCriada]);
      
      setNovaPessoa({ 
        nome: "", 
        email: "", 
        tipo_usuario: TipoUsuario.DOCENTE,
        unidade_id: undefined
      });
      setSelectedRegionalId(undefined);
      setSelectedUnidadeId(undefined);

      toast({
        title: "Sucesso",
        description: `Pessoa ${novaPessoaCriada.nome} cadastrada com sucesso`
      });

    } catch (error: any) {
      console.error('Erro ao criar pessoa:', error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar",
        description: error?.response?.data?.message || "Não foi possível cadastrar a pessoa"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePessoa = async (pessoaId: number) => {
    if (!confirm('Tem certeza que deseja remover esta pessoa?')) {
      return;
    }

    setLoading(true);
    try {
      await userService.delete(pessoaId);
      setPessoas(prev => prev.filter(p => p.pessoa_id !== pessoaId));
      
      toast({
        title: "Sucesso",
        description: "Pessoa removida com sucesso"
      });
    } catch (error: any) {
      console.error('Erro ao remover pessoa:', error);
      toast({
        variant: "destructive",
        title: "Erro ao remover",
        description: error?.response?.data?.message || "Não foi possível remover a pessoa"
      });
    } finally {
      setLoading(false);
    }
  };

  const resolveVinculoUnidade = (pessoa: User) => {
    const targetId = selectedUnidadeId ?? filterUnidadeId;
    const vinculos = pessoa.unidades ?? [];
    if (targetId) {
      const match = vinculos.find(
        u => String(u.unidade_id) === String(targetId) || String(u.unidade?.unidade_id) === String(targetId)
      );
      if (match) return match;
    }
    return vinculos[0];
  };

  const getCargoNaUnidade = (pessoa: User): CargoUnidade | null => {
    const vinculo = resolveVinculoUnidade(pessoa);
    return (vinculo?.cargo as CargoUnidade | undefined) ?? null;
  };

  const handleOpenEdit = (pessoa: User) => {
    setEditingPessoa(pessoa);
    setEditForm({
      nome: pessoa.nome || '',
      tipo_usuario: pessoa.tipo_usuario,
      ativo: pessoa.ativo ?? true,
      cargo: getCargoNaUnidade(pessoa),
    });
  };

  const handleSaveEdit = async () => {
    if (!editingPessoa) return;

    if (!editForm.nome.trim()) {
      toast({ variant: 'destructive', title: 'Campo obrigatório', description: 'O nome não pode estar vazio' });
      return;
    }

    setSavingEdit(true);
    try {
      const updateData: UpdateUserData = {
        nome: editForm.nome.trim(),
        tipo_usuario: editForm.tipo_usuario,
        ativo: editForm.ativo,
      };
      const updated = await userService.update(String(editingPessoa.pessoa_id), updateData);

      // Atualizar cargo apenas se mudou e se houver vínculo de unidade
      const vinculo = resolveVinculoUnidade(editingPessoa);
      const cargoOriginal = (vinculo?.cargo as CargoUnidade | undefined) ?? null;
      const unidadeIdParaCargo = vinculo
        ? String(vinculo.unidade_id ?? vinculo.unidade?.unidade_id ?? '')
        : '';
      const cargoMudou = editForm.cargo !== cargoOriginal;
      if (unidadeIdParaCargo && cargoMudou) {
        await userService.updateCargoUnidade(
          String(editingPessoa.pessoa_id),
          unidadeIdParaCargo,
          editForm.cargo,
        );
      }

      setPessoas(prev =>
        prev.map(p => p.pessoa_id === editingPessoa.pessoa_id
          ? {
              ...p, ...updated,
              unidades: cargoMudou
                ? p.unidades?.map(u =>
                    String(u.unidade_id) === unidadeIdParaCargo || String(u.unidade?.unidade_id) === unidadeIdParaCargo
                      ? { ...u, cargo: editForm.cargo }
                      : u
                  )
                : p.unidades,
            }
          : p)
      );
      setEditingPessoa(null);
      toast({ title: 'Sucesso', description: 'Dados atualizados com sucesso' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: error?.response?.data?.message || 'Não foi possível salvar as alterações',
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const getUnidadeNome = (pessoa: User) => {
    if (pessoa.unidades && pessoa.unidades.length > 0) {
      if (pessoa.unidades[0].unidade && pessoa.unidades[0].unidade.nome_unidade) {
        return pessoa.unidades[0].unidade.nome_unidade;
      }
      return 'Nome não disponível';
    }

    // Pessoa sem unidade — verificar vínculo regional
    const regionaisPessoa = (pessoa as any).pessoaRegionais;
    if (regionaisPessoa && regionaisPessoa.length > 0) {
      const regional = regionaisPessoa[0].regional;
      if (regional) {
        return regional.nome_regional || regional.nome || 'Regional sem nome';
      }
    }

    return 'Unidade não definida';
  };

  const getRegionalNameById = (id?: number) => {
    if (!id) return undefined;
    const found = regionais.find(r => r.regional_id === id || r.id === id);
    if (found) return found.nome || found.nome_regional || found.title || found.label;

    const first = fetchedUserDetails?.unidades?.[0] || (user as any)?.unidades?.[0];
    const fromUser = first?.regional?.nome || first?.unidade?.regional?.nome || first?.regional_nome || first?.nome_regional || first?.unidade?.nome || first?.unidade?.nome_unidade;
    if (fromUser) return fromUser;

    return undefined;
  };

  const getLoggedUserUnidadeNome = () => {
    const first = fetchedUserDetails?.unidades?.[0] || (user as any)?.unidades?.[0];
    if (!first) return 'Unidade não definida';
    if (first.unidade && (first.unidade.nome_unidade || first.unidade.nome)) return first.unidade.nome_unidade || first.unidade.nome;
    if (first.nome_unidade) return first.nome_unidade;
    if (first.nome) return first.nome;
    if (first.unidade_nome) return first.unidade_nome;
    const maybeUnidade = first.unidade || first;
    const possibleName = maybeUnidade?.nome_unidade || maybeUnidade?.nome || maybeUnidade?.title;
    return possibleName || 'Unidade não definida';
  };

  const tiposUsuario = [
    { value: TipoUsuario.ADMINISTRADOR, label: "Administrador" },
    { value: TipoUsuario.CPS, label: "CPS" },
    { value: TipoUsuario.REGIONAL, label: "Regional" },
    { value: TipoUsuario.DIRETOR, label: "Diretor" },
    { value: TipoUsuario.COORDENADOR, label: "Coordenador" },
    { value: TipoUsuario.ADMINISTRATIVO, label: "Administrativo" },
    { value: TipoUsuario.DOCENTE, label: "Docente" },
  ];

  const getTiposUsuarioPermitidos = () => {
    const userTipo = (user as any)?.tipo_usuario || (user as any)?.tipoUsuario;
    
    if (userTipo === TipoUsuario.ADMINISTRADOR) {
      return tiposUsuario;
    } else if (userTipo === TipoUsuario.CPS) {
      return tiposUsuario.filter(tipo =>
        ![TipoUsuario.ADMINISTRADOR, TipoUsuario.CPS].includes(tipo.value as TipoUsuario)
      );
    } else if (userTipo === TipoUsuario.REGIONAL) {
      return tiposUsuario.filter(tipo => 
        [TipoUsuario.DIRETOR, TipoUsuario.COORDENADOR, TipoUsuario.ADMINISTRATIVO, TipoUsuario.DOCENTE].includes(tipo.value as TipoUsuario)
      );
    } else if (userTipo === TipoUsuario.DIRETOR) {
      return tiposUsuario.filter(tipo => 
        [TipoUsuario.COORDENADOR, TipoUsuario.ADMINISTRATIVO, TipoUsuario.DOCENTE].includes(tipo.value as TipoUsuario)
      );
    } else {
      return tiposUsuario.filter(tipo => 
        [TipoUsuario.ADMINISTRATIVO, TipoUsuario.DOCENTE].includes(tipo.value as TipoUsuario)
      );
    }
  };
  
  const filteredPessoas = pessoas.filter(pessoa => {
    const nome = (pessoa.nome || '').toString().toLowerCase();
    const email = (pessoa.email || '').toString().toLowerCase();
    const tipo = (pessoa.tipo_usuario || '').toString().toLowerCase();
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch = nome.includes(term) || email.includes(term) || tipo.includes(term);

    // Filtro "somente CPS/Administrador" — sem vínculo de unidade
    if (filterOnlyCPS) {
      return matchesSearch && (
        pessoa.tipo_usuario === TipoUsuario.ADMINISTRADOR ||
        pessoa.tipo_usuario === TipoUsuario.CPS
      );
    }

    // Filtro "somente regional" — apenas vínculo direto com a regional, sem unidades
    if (filterUnidadeId === '__regional__' && filterRegionalId) {
      const regionaisPessoa = (pessoa as any).pessoaRegionais ?? [];
      return matchesSearch && regionaisPessoa.some(
        (r: any) => String(r.regional_id) === String(filterRegionalId)
      );
    }

    // Filtro por unidade específica
    if (filterUnidadeId) {
      return matchesSearch && pessoa.unidades?.some(
        (u: any) => String(u.unidade_id ?? u.unidade?.unidade_id) === String(filterUnidadeId)
      );
    }

    // Filtro somente por regional (todas as unidades dela)
    if (filterRegionalId) {
      return matchesSearch && pessoa.unidades?.some(
        (u: any) => String(u.unidade?.regional_id ?? u.regional_id) === String(filterRegionalId)
      );
    }

    // Filtro legado por filterUnidadeId sem regional (Regional user)
    const matchesUnidade = !filterUnidadeId || pessoa.unidades?.some(
      (u: any) => (u.unidade_id ?? u.unidade?.unidade_id) === filterUnidadeId
    );
    return matchesSearch && matchesUnidade;
  });

  const getTypeBadgeColor = (tipo: TipoUsuario) => {
    switch(tipo) {
      case TipoUsuario.ADMINISTRADOR: return "bg-red-100 text-red-800 border-red-300";
      case TipoUsuario.CPS: return "bg-red-100 text-red-800 border-red-300";
      case TipoUsuario.REGIONAL: return "bg-orange-100 text-orange-800 border-orange-300";
      case TipoUsuario.DIRETOR: return "bg-green-100 text-green-800 border-green-300";
      case TipoUsuario.COORDENADOR: return "bg-teal-100 text-teal-800 border-teal-300";
      case TipoUsuario.ADMINISTRATIVO: return "bg-purple-100 text-purple-800 border-purple-300";
      case TipoUsuario.DOCENTE: return "bg-blue-100 text-blue-800 border-blue-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const toggleAccessRequests = () => {
    setShowAccessRequests(!showAccessRequests);
  };

  const userTipo = (user as any)?.tipo_usuario || (user as any)?.tipoUsuario;
  const canManagePessoas = userTipo && [
    TipoUsuario.ADMINISTRADOR, 
    TipoUsuario.CPS, 
    TipoUsuario.DIRETOR, 
  ].includes(userTipo);

  const canViewAccessRequests = userTipo && [
    TipoUsuario.ADMINISTRADOR, 
    TipoUsuario.CPS,
    TipoUsuario.DIRETOR
  ].includes(userTipo);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ae0f0a] mr-3"></div>
        <span className="text-gray-500">Carregando dados do usuário...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header responsivo */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0 lg:space-x-4 pt-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-start space-x-3">
            <UserRound className="h-5 w-5 sm:h-6 sm:w-6 mt-1 text-[#ae0f0a] flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 leading-tight">
                Gerenciar Pessoas
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 leading-relaxed">
                {userTipo === TipoUsuario.ADMINISTRADOR || userTipo === TipoUsuario.CPS
                  ? "Cadastre pessoas para atribuição em projetos e ações (todas as unidades)"
                  : "Cadastre pessoas para atribuição em projetos e ações (sua unidade)"
                }
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-shrink-0">
          <span className="text-xs sm:text-sm text-gray-500 text-center sm:text-left whitespace-nowrap">
            {filteredPessoas.length} registros
          </span>
          
          {/* Botão de solicitações de acesso - apenas para admin e CPS */}
          {canViewAccessRequests && (
            <Button 
              variant="outline" 
              onClick={toggleAccessRequests}
              className="flex items-center justify-center text-[#ae0f0a] border-[#ae0f0a]/20 hover:bg-[#ae0f0a]/10 relative text-xs sm:text-sm px-3 py-2"
              disabled={loadingRequests}
            >
              <InboxIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">Solicitações de Acesso</span>
              {pendingRequestsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium min-w-[16px] sm:min-w-[20px]">
                  {pendingRequestsCount > 99 ? '99+' : pendingRequestsCount}
                </span>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Card que alterna entre Adicionar Pessoas e Solicitações de Acesso */}
      {canManagePessoas && userTipo !== TipoUsuario.REGIONAL && <Card className="border border-gray-200 shadow-sm">
        <div className="p-4 sm:p-5">
          {!showAccessRequests ? (
            <>
              <h3 className="text-sm sm:text-md font-medium mb-3 sm:mb-4 text-gray-700 flex items-center">
                <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[#ae0f0a] flex-shrink-0" />
                Adicionar Nova Pessoa
              </h3>
              
              {canManagePessoas ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                    <div>
                      <label htmlFor="nome" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Nome Completo
                      </label>
                      <Input
                        id="nome"
                        placeholder="Ex: João Silva"
                        value={novaPessoa.nome}
                        onChange={e => setNovaPessoa({ ...novaPessoa, nome: e.target.value })}
                        className="w-full bg-white border-gray-300 text-sm"
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        E-mail
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Ex: joao@fatec.sp.gov.br"
                        value={novaPessoa.email}
                        onChange={e => setNovaPessoa({ ...novaPessoa, email: e.target.value })}
                        className="w-full bg-white border-gray-300 text-sm"
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="tipo" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Tipo
                      </label>
                      <Select
                        value={novaPessoa.tipo_usuario}
                        onValueChange={(value) => setNovaPessoa({ ...novaPessoa, tipo_usuario: value as TipoUsuario })}
                        disabled={loading}
                      >
                        <SelectTrigger className="w-full bg-white border-gray-300 text-gray-800 text-sm">
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {getTiposUsuarioPermitidos().map(tipo => (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                {tipo.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Seleções condicionais: regional / unidade */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                    {/* Exibir diferentes campos dependendo do tipo selecionado */}
                    {(() => {
                      const tipoSelecionado = novaPessoa.tipo_usuario as TipoUsuario;

                      if (tipoSelecionado === TipoUsuario.ADMINISTRADOR || tipoSelecionado === TipoUsuario.CPS) {
                        return (
                          <div className="lg:col-span-3 text-sm text-gray-600">
                            Não é necessário selecionar Regional ou Unidade para Administrador/CPS.
                          </div>
                        );
                      }

                      if (tipoSelecionado === TipoUsuario.REGIONAL) {
                        return (
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Regional</label>
                            <Select
                              value={selectedRegionalId?.toString() || ""}
                              onValueChange={(v) => setSelectedRegionalId(v || undefined)}
                              disabled={regionais.length === 0}
                            >
                              <SelectTrigger className="w-full bg-white border-gray-300 text-gray-800 text-sm">
                                <SelectValue placeholder={regionais.length ? "Selecione uma regional" : "Sem regionais disponíveis"} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {regionais.map(r => (
                                    <SelectItem key={r.regional_id} value={r.regional_id?.toString() || ''}>{r.nome}</SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                        );
                      }

                      const isAdminView = ((user as any)?.tipo_usuario || (user as any)?.tipoUsuario) === TipoUsuario.ADMINISTRADOR || ((user as any)?.tipo_usuario || (user as any)?.tipoUsuario) === TipoUsuario.CPS || ((user as any)?.tipo_usuario || (user as any)?.tipoUsuario) === TipoUsuario.REGIONAL;

                      if (isAdminView) {
                        return (
                          <>
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Regional</label>
                              <Select
                                value={selectedRegionalId?.toString() || ""}
                                onValueChange={(v) => setSelectedRegionalId(v || undefined)}
                                disabled={regionais.length === 0}
                              >
                                <SelectTrigger className="w-full bg-white border-gray-300 text-gray-800 text-sm">
                                  <SelectValue placeholder={regionais.length ? "Selecione uma regional" : "Sem regionais disponíveis"} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {regionais.map(r => (
                                      <SelectItem key={r.regional_id} value={r.regional_id?.toString() || ''}>{r.nome}</SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Unidade</label>
                              <Select
                                value={selectedUnidadeId?.toString() || ""}
                                onValueChange={(v) => setSelectedUnidadeId(v || undefined)}
                                disabled={unidades.length === 0}
                              >
                                <SelectTrigger className="w-full bg-white border-gray-300 text-gray-800 text-sm">
                                  <SelectValue placeholder={unidades.length ? "Selecione uma unidade" : "Sem unidades disponíveis"} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {unidades.map(u => (
                                      <SelectItem key={u.unidade_id} value={u.unidade_id.toString()}>{u.nome_unidade}</SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        );
                      }

                      return (
                        <>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Regional</label>
                            <div className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-700">
                              {getRegionalNameById(selectedRegionalId) || 'Regional não disponível'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Unidade</label>
                            <div className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-700">
                              {getLoggedUserUnidadeNome()}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleAddPessoa} 
                      className="bg-[#ae0f0a] hover:bg-[#910c08] text-white flex items-center text-sm px-3 sm:px-4 py-2"
                      disabled={loading}
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> 
                      {loading ? 'Adicionando...' : 'Adicionar Pessoa'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-500 px-4">
                  <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-gray-400" />
                  <p className="text-sm sm:text-base">Você não tem permissão para cadastrar pessoas.</p>
                  <p className="text-xs sm:text-sm mt-1">Entre em contato com o administrador do sistema.</p>
                  <p className="text-xs mt-2 text-gray-400">Tipo de usuário atual: {userTipo}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
                <h3 className="text-sm sm:text-md font-medium text-gray-700 flex items-center">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[#ae0f0a] flex-shrink-0" />
                  <span className="truncate">
                    {userTipo === TipoUsuario.DIRETOR 
                      ? "Solicitações de Acesso da sua Unidade" 
                      : "Solicitações de Acesso Pendentes"}
                  </span>
                </h3>
                <Button 
                  variant="outline" 
                  onClick={toggleAccessRequests}
                  size="sm"
                  className="text-xs sm:text-sm px-3 py-2 w-full sm:w-auto"
                >
                  Voltar para Pessoas
                </Button>
              </div>
              <PendingAccessRequestsTab onRequestProcessed={loadAccessRequests} />
            </>
          )}
        </div>
      </Card>}
      
      {/* Lista de Pessoas - só mostra quando não estiver na aba de solicitações */}
      {(userTipo === TipoUsuario.REGIONAL || !showAccessRequests) && (
        <div>
          <div className="flex flex-wrap gap-3 items-center justify-between mb-3">
            <h3 className="text-md font-medium text-gray-700">
              Pessoas Cadastradas
              {userTipo === TipoUsuario.REGIONAL && (
                <span className="text-sm font-normal text-gray-500 ml-2">(da sua regional)</span>
              )}
              {userTipo !== TipoUsuario.ADMINISTRADOR && userTipo !== TipoUsuario.CPS && userTipo !== TipoUsuario.REGIONAL && (
                <span className="text-sm font-normal text-gray-500 ml-2">(da sua unidade)</span>
              )}
            </h3>
            
            <div className="flex gap-2 flex-wrap">
              {(userTipo === TipoUsuario.ADMINISTRADOR || userTipo === TipoUsuario.CPS) && (
                <>
                  <select
                    value={filterRegionalId ?? ''}
                    onChange={e => {
                      setFilterRegionalId(e.target.value || undefined);
                      setFilterUnidadeId(undefined);
                      if (e.target.value) setFilterOnlyCPS(false);
                    }}
                    disabled={filterOnlyCPS}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#ae0f0a] disabled:opacity-40"
                  >
                    <option value="">Todas as regionais</option>
                    {regionais.map(r => (
                      <option key={r.regional_id} value={r.regional_id}>{r.nome}</option>
                    ))}
                  </select>
                  <select
                    value={filterUnidadeId ?? ''}
                    onChange={e => setFilterUnidadeId(e.target.value || undefined)}
                    disabled={filterOnlyCPS || !filterRegionalId}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#ae0f0a] disabled:opacity-40"
                  >
                    <option value="">Todas as unidades</option>
                    <option value="__regional__">Somente Regional</option>
                    {filterUnidades.map(u => (
                      <option key={u.unidade_id} value={u.unidade_id}>{u.nome_unidade}</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 cursor-pointer select-none hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={filterOnlyCPS}
                      onChange={e => {
                        setFilterOnlyCPS(e.target.checked);
                        if (e.target.checked) {
                          setFilterRegionalId(undefined);
                          setFilterUnidadeId(undefined);
                        }
                      }}
                      className="accent-[#ae0f0a]"
                    />
                    Somente CPS
                  </label>
                </>
              )}
              {userTipo === TipoUsuario.REGIONAL && unidades.length > 0 && (
                <select
                  value={filterUnidadeId ?? ''}
                  onChange={e => setFilterUnidadeId(e.target.value || undefined)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#ae0f0a]"
                >
                  <option value="">Todas as unidades</option>
                  {unidades.map(u => (
                    <option key={u.unidade_id} value={u.unidade_id}>{u.nome_unidade}</option>
                  ))}
                </select>
              )}
              <div className="relative w-64">
                <Input
                  placeholder="Pesquisar pessoas..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white"
                  disabled={loading}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="border rounded-md shadow-sm bg-white overflow-hidden">
            {loading ? (
              <div className="py-8 text-center">
                <div className="flex justify-center mb-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ae0f0a]"></div>
                </div>
                <p className="text-gray-500">Carregando pessoas...</p>
              </div>
            ) : filteredPessoas.length > 0 ? (
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    {(userTipo === TipoUsuario.ADMINISTRADOR || userTipo === TipoUsuario.CPS || userTipo === TipoUsuario.REGIONAL) && (
                      <TableHead>Unidade</TableHead>
                    )}
                    <TableHead>Cargo na Unidade</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    {canManagePessoas && <TableHead className="w-32 text-right">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPessoas
                    .sort((a, b) =>
                      (a.nome || '').toString().localeCompare((b.nome || '').toString()),
                    )
                    .map(pessoa => (
                      <TableRow key={pessoa.pessoa_id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-700">
                          {pessoa.nome}
                        </TableCell>
                        <TableCell>{pessoa.email || '-'}</TableCell>
                        {(userTipo === TipoUsuario.ADMINISTRADOR || userTipo === TipoUsuario.CPS || userTipo === TipoUsuario.REGIONAL) && (
                          <TableCell className="text-sm text-gray-600">
                            <div className="group relative">
                              {getUnidadeNome(pessoa)}
                              
                              {pessoa.unidades && pessoa.unidades.length > 1 && (
                                <div className="absolute hidden group-hover:block z-10 bg-white border shadow-md rounded p-2 w-60">
                                  <p className="font-medium mb-1 text-xs text-gray-500">
                                    Todas as unidades:
                                  </p>
                                  <ul className="text-xs">
                                    {pessoa.unidades.map((u) => (
                                      <li
                                        key={u.unidade_id}
                                        className="py-1 border-b last:border-0"
                                      >
                                        {u.unidade && u.unidade.nome_unidade ? u.unidade.nome_unidade : "Nome não disponível"}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        )}
                        <TableCell className="text-sm text-gray-600">
                          {(() => {
                            const cargo = getCargoNaUnidade(pessoa);
                            return cargo ? CARGO_UNIDADE_LABELS[cargo] : <span className="text-gray-400">—</span>;
                          })()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${getTypeBadgeColor(pessoa.tipo_usuario)} font-semibold`}>
                            {tiposUsuario.find(t => t.value === pessoa.tipo_usuario)?.label || pessoa.tipo_usuario}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={pessoa.ativo ? "default" : "secondary"}>
                            {pessoa.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        {canManagePessoas && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {(userTipo === TipoUsuario.ADMINISTRADOR || userTipo === TipoUsuario.DIRETOR) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenEdit(pessoa)}
                                  className="text-gray-600 border-gray-200 hover:bg-gray-50 px-2"
                                  disabled={loading}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleRemovePessoa(pessoa.pessoa_id)}
                                className="bg-[#ae0f0a]/10 hover:bg-[#ae0f0a]/20 text-[#ae0f0a] border border-[#ae0f0a]/20"
                                disabled={loading}
                              >
                                Remover
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center">
                <div className="flex justify-center mb-3">
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">
                  {searchTerm ? "Nenhuma pessoa encontrada com estes critérios." : "Não há pessoas cadastradas ainda."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal de Edição ────────────────────────────────── */}
      <Modal
        isOpen={!!editingPessoa}
        onClose={() => setEditingPessoa(null)}
        title="Editar Pessoa"
      >
        {editingPessoa && (
          <div className="p-6 space-y-5">
            {/* Email — somente leitura */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                E-mail
                <span className="ml-2 text-xs text-gray-400 font-normal">(não pode ser alterado)</span>
              </label>
              <div className="w-full bg-gray-50 dark:bg-[#21262d] border border-gray-200 dark:border-[#30363d] rounded-md px-3 py-2 text-sm text-gray-500 dark:text-gray-400 select-none">
                {editingPessoa.email || '—'}
              </div>
            </div>

            {/* Nome — editável */}
            <div>
              <label htmlFor="edit-nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome Completo
              </label>
              <Input
                id="edit-nome"
                value={editForm.nome}
                onChange={e => setEditForm(prev => ({ ...prev, nome: e.target.value }))}
                className="w-full bg-white dark:bg-[#21262d] border-gray-300 dark:border-[#30363d] text-sm"
                disabled={savingEdit}
              />
            </div>

            {/* Tipo de usuário — editável com restrições */}
            <div>
              <label htmlFor="edit-tipo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Usuário
              </label>
              <Select
                value={editForm.tipo_usuario}
                onValueChange={v => setEditForm(prev => ({ ...prev, tipo_usuario: v as TipoUsuario }))}
                disabled={savingEdit}
              >
                <SelectTrigger id="edit-tipo" className="w-full bg-white dark:bg-[#21262d] border-gray-300 dark:border-[#30363d] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {getTiposUsuarioPermitidos().map(tipo => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Unidade — somente leitura */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unidade
                <span className="ml-2 text-xs text-gray-400 font-normal">(não pode ser alterada)</span>
              </label>
              <div className="w-full bg-gray-50 dark:bg-[#21262d] border border-gray-200 dark:border-[#30363d] rounded-md px-3 py-2 text-sm text-gray-500 dark:text-gray-400 select-none">
                {getUnidadeNome(editingPessoa)}
              </div>
            </div>

            {/* Cargo na Unidade */}
            {(userTipo === TipoUsuario.ADMINISTRADOR || userTipo === TipoUsuario.DIRETOR) && (
              <div>
                <label htmlFor="edit-cargo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cargo na Unidade
                  <span className="ml-2 text-xs text-gray-400 font-normal">(Equipe Gestora do PGA)</span>
                </label>
                <Select
                  value={editForm.cargo ?? '__none__'}
                  onValueChange={v => setEditForm(prev => ({ ...prev, cargo: v === '__none__' ? null : v as CargoUnidade }))}
                  disabled={savingEdit}
                >
                  <SelectTrigger id="edit-cargo" className="w-full bg-white dark:bg-[#21262d] border-gray-300 dark:border-[#30363d] text-sm">
                    <SelectValue placeholder="Sem cargo de gestão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="__none__">Sem cargo de gestão</SelectItem>
                      {Object.entries(CARGO_UNIDADE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Status ativo */}
            <div className="flex items-center justify-between py-2 px-4 rounded-lg border border-gray-200 dark:border-[#30363d]">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pessoa ativa no sistema</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={editForm.ativo}
                onClick={() => setEditForm(prev => ({ ...prev, ativo: !prev.ativo }))}
                disabled={savingEdit}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#ae0f0a]/50 ${
                  editForm.ativo ? 'bg-[#ae0f0a]' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    editForm.ativo ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setEditingPessoa(null)}
                disabled={savingEdit}
                className="px-5"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="bg-[#ae0f0a] hover:bg-[#8e0c08] text-white px-5"
              >
                {savingEdit ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};