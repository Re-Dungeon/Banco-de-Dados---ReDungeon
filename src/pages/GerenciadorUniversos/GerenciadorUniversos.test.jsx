import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mocks = vi.hoisted(() => {
  const transactionUpdate = vi.fn();
  const runTransaction = vi.fn(async (_, callback) => {
    const transaction = {
      get: async ref => ({
        exists: () => true,
        data: () => {
          const currentState = {
            a1: { universos: ['u2'] },
            a2: { universos: ['u2'] },
            c1: { universos: ['u2'] },
          };

          return currentState[ref.id] || { universos: [] };
        },
      }),
      update: transactionUpdate,
    };

    return callback(transaction);
  });

  return { transactionUpdate, runTransaction };
});

const authState = vi.hoisted(() => ({
  isAdmin: false,
  allowedUniversos: ['u1'],
  canCreate: () => true,
  canWrite: universoId =>
    Array.isArray(universoId)
      ? universoId.some(id => id === 'u1')
      : universoId === 'u1',
}));

const getUniversos = vi.fn();
const getAptidoes = vi.fn();
const getClasses = vi.fn();
const getRacas = vi.fn();
const getMateriais = vi.fn();
const getItens = vi.fn();
const getReceitas = vi.fn();
const getArtes = vi.fn();
const getOrigens = vi.fn();
const getDivindades = vi.fn();
const getCorposEspeciais = vi.fn();
const getVeiasAstrais = vi.fn();
const getReinosCultivo = vi.fn();
const getTricksterCoinBeneficios = vi.fn();
const getCardFlux = vi.fn();
const addUniverso = vi.fn();
const updateUniverso = vi.fn();
const removeUniverso = vi.fn();
const removeAptidao = vi.fn();
const updateAptidao = vi.fn();
const removeClasse = vi.fn();
const removeRaca = vi.fn();
const removeMaterial = vi.fn();
const removeIten = vi.fn();
const removeReceita = vi.fn();
const removeArte = vi.fn();
const removeOrigem = vi.fn();
const removeDivindade = vi.fn();
const removeCorpoEspecial = vi.fn();
const removeVeiaAstral = vi.fn();
const removeReinoCultivo = vi.fn();
const removeTricksterCoinBeneficio = vi.fn();
const removeRegra = vi.fn();
const removeCardFlux = vi.fn();
const getCondicoes = vi.fn();
const removeCondicao = vi.fn();
const updateCondicao = vi.fn();
const getCampanhas = vi.fn();
const getRegras = vi.fn();
const getPersonagens = vi.fn();
const getAllRegisteredUsers = vi.fn();
const getUserPermissions = vi.fn();

vi.mock('service/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  doc: (_, collectionName, id) => ({ collectionName, id }),
  runTransaction: mocks.runTransaction,
  serverTimestamp: () => 'server-timestamp',
}));

vi.mock('service/storage', () => ({
  getUniversos: (...args) => getUniversos(...args),
  getAptidoes: (...args) => getAptidoes(...args),
  getClasses: (...args) => getClasses(...args),
  getRacas: (...args) => getRacas(...args),
  getMateriais: (...args) => getMateriais(...args),
  getItens: (...args) => getItens(...args),
  getReceitas: (...args) => getReceitas(...args),
  getArtes: (...args) => getArtes(...args),
  getOrigens: (...args) => getOrigens(...args),
  getDivindades: (...args) => getDivindades(...args),
  getCorposEspeciais: (...args) => getCorposEspeciais(...args),
  getVeiasAstrais: (...args) => getVeiasAstrais(...args),
  getReinosCultivo: (...args) => getReinosCultivo(...args),
  getTricksterCoinBeneficios: (...args) => getTricksterCoinBeneficios(...args),
  getCardFlux: (...args) => getCardFlux(...args),
  getRegras: (...args) => getRegras(...args),
  getPersonagens: (...args) => getPersonagens(...args),
  getAllRegisteredUsers: (...args) => getAllRegisteredUsers(...args),
  getUserPermissions: (...args) => getUserPermissions(...args),
  addUniverso: (...args) => addUniverso(...args),
  updateUniverso: (...args) => updateUniverso(...args),
  removeUniverso: (...args) => removeUniverso(...args),
  removeAptidao: (...args) => removeAptidao(...args),
  updateAptidao: (...args) => updateAptidao(...args),
  removeClasse: (...args) => removeClasse(...args),
  removeRaca: (...args) => removeRaca(...args),
  removeMaterial: (...args) => removeMaterial(...args),
  removeIten: (...args) => removeIten(...args),
  removeReceita: (...args) => removeReceita(...args),
  removeArte: (...args) => removeArte(...args),
  removeOrigem: (...args) => removeOrigem(...args),
  removeDivindade: (...args) => removeDivindade(...args),
  removeCorpoEspecial: (...args) => removeCorpoEspecial(...args),
  removeVeiaAstral: (...args) => removeVeiaAstral(...args),
  removeReinoCultivo: (...args) => removeReinoCultivo(...args),
  removeTricksterCoinBeneficio: (...args) => removeTricksterCoinBeneficio(...args),
  removeRegra: (...args) => removeRegra(...args),
  removeCardFlux: (...args) => removeCardFlux(...args),
  getCondicoes: (...args) => getCondicoes(...args),
  removeCondicao: (...args) => removeCondicao(...args),
  updateCondicao: (...args) => updateCondicao(...args),
  getCampanhas: (...args) => getCampanhas(...args),
}));

vi.mock('context/AuthContext', () => ({
  useAuth: () => authState,
}));

import { invalidateUniversosCache } from 'hooks/useUniversos';
import GerenciadorUniversos, {
  createDeletionLookupMaps,
  removeSuccessfulDeletionRecords,
} from './GerenciadorUniversos';

const waitForDeletionTabToLoad = async () => {
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Selecionar todos' })).toBeInTheDocument();
  });
};

describe('GerenciadorUniversos', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('redungeon:skip_delete_confirmation', 'false');
    invalidateUniversosCache();
    vi.clearAllMocks();
    mocks.transactionUpdate.mockClear();
    mocks.runTransaction.mockClear();
    getUniversos.mockResolvedValue([
      { id: 'u1', Nome: 'Mundo A' },
      { id: 'u2', Nome: 'Mundo B' },
    ]);
    getCampanhas.mockResolvedValue([
      { id: 'c1', nome: 'Campanha A', universoId: 'u1', linkImagem: 'https://example.com/campanha.png' },
    ]);
    updateUniverso.mockResolvedValue(undefined);
    removeUniverso.mockResolvedValue(undefined);
    removeAptidao.mockResolvedValue(undefined);
    removeCondicao.mockResolvedValue(undefined);
    getRegras.mockResolvedValue([]);
    getPersonagens.mockResolvedValue([]);
    getAllRegisteredUsers.mockResolvedValue([]);
    getUserPermissions.mockResolvedValue({ isAdmin: false, universos: [] });
  });

  it('permite excluir o universo diretamente no popup com confirmação', async () => {
    getAptidoes.mockResolvedValue([]);
    getCondicoes.mockResolvedValue([]);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Gerenciador de Universos')).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: 'Universos' }));
    await user.dblClick(screen.getByText('Mundo A'));

    await waitFor(() => expect(screen.getByText('Campanhas criadas')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Excluir universo' }));

    await waitFor(() => expect(screen.getByText('Confirmar exclusão')).toBeInTheDocument());
    expect(
      screen.getByText(/Para excluir este universo, é recomendado remover primeiro os dados vinculados/i),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    await waitFor(() => expect(removeUniverso).toHaveBeenCalledWith('u1'));
  });

  it('abre o popup do universo com campanhas e fallback de imagem ao dar duplo clique', async () => {
    getAptidoes.mockResolvedValue([]);
    getCondicoes.mockResolvedValue([]);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Gerenciador de Universos')).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: 'Universos' }));

    await waitFor(() => expect(screen.getByText('Mundo A')).toBeInTheDocument());
    await user.dblClick(screen.getByText('Mundo A'));

    await waitFor(() => expect(screen.getByText('Campanhas criadas')).toBeInTheDocument());
    expect(screen.getAllByText('Campanha A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mundo A').length).toBeGreaterThan(0);
  });

  it('permite editar o nome do universo no popup e salvar a alteração', async () => {
    getAptidoes.mockResolvedValue([]);
    getCondicoes.mockResolvedValue([]);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Gerenciador de Universos')).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: 'Universos' }));
    await user.dblClick(screen.getByText('Mundo A'));

    await waitFor(() => expect(screen.getByText('Campanhas criadas')).toBeInTheDocument());

    const nameInput = await screen.findByLabelText('Nome do universo');
    await user.clear(nameInput);
    await user.type(nameInput, 'Mundo A Atualizado');
    await user.click(screen.getByRole('button', { name: 'Salvar alterações do universo' }));

    await waitFor(() => expect(screen.getByText('Universo atualizado.')).toBeInTheDocument());
    expect(updateUniverso).toHaveBeenCalledWith('u1', expect.objectContaining({ Nome: 'Mundo A Atualizado' }));
  });

  it('permite salvar a imagem do universo por campanha ou link no popup', async () => {
    getAptidoes.mockResolvedValue([]);
    getCondicoes.mockResolvedValue([]);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Gerenciador de Universos')).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: 'Universos' }));
    await user.dblClick(screen.getByText('Mundo A'));

    await waitFor(() => expect(screen.getByText('Campanhas criadas')).toBeInTheDocument());
    expect(screen.getByLabelText('Fonte da imagem')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Fonte da imagem'));
    await user.click(screen.getByRole('option', { name: 'Usar link direto' }));

    const inputLink = await screen.findByLabelText('URL da imagem do universo');
    await user.clear(inputLink);
    await user.type(inputLink, 'https://example.com/universo.png');
    await user.click(screen.getByRole('button', { name: 'Salvar imagem do universo' }));

    await waitFor(() => expect(screen.getByText('Imagem do universo salva.')).toBeInTheDocument());
  });

  it('carrega aptidões vinculadas e não vinculadas ao universo selecionado', async () => {
    getAptidoes.mockResolvedValue([
      { id: 'a1', nome: 'Aptidão A', universos: ['u1'] },
      { id: 'a2', nome: 'Aptidão B', universos: ['u2'] },
    ]);
    getCondicoes.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Gerenciador de Universos')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Aptidão A')).toBeInTheDocument());
    expect(screen.getByText('Aptidão B')).toBeInTheDocument();
  });

  it('filtra a lista de universos pelo nome em tempo real', async () => {
    getAptidoes.mockResolvedValue([]);
    getCondicoes.mockResolvedValue([]);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Gerenciador de Universos')).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: 'Universos' }));

    const input = await screen.findByLabelText('Pesquisar universos');
    await user.type(input, 'Mundo B');

    expect(screen.getByText('Mundo B')).toBeInTheDocument();
    expect(screen.queryByText('Mundo A')).not.toBeInTheDocument();
  });

  it('desativa e reativa universos somente para administradores', async () => {
    getAptidoes.mockResolvedValue([]);
    getCondicoes.mockResolvedValue([]);
    authState.isAdmin = true;
    getUniversos.mockResolvedValue([
      { id: 'u1', Nome: 'Mundo A', ativo: true },
      { id: 'u2', Nome: 'Mundo B', ativo: false },
    ]);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Gerenciador de Universos')).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: 'Universos' }));
    await user.dblClick(screen.getByText('Mundo A'));

    await waitFor(() => expect(screen.getByText('Status do universo')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Desativar universo' }));

    await waitFor(() => expect(screen.getByText('Confirmar desativação')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Desativar' }));

    await waitFor(() => expect(updateUniverso).toHaveBeenCalledWith('u1', { ativo: false }));
    expect(updateUniverso).toHaveBeenCalledTimes(1);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Reativar universo' })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Reativar universo' }));

    await waitFor(() => expect(screen.getByText('Confirmar reativação')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Reativar' }));

    await waitFor(() => expect(updateUniverso).toHaveBeenCalledWith('u1', { ativo: true }));
  });

  it('filtra universos ativos e inativos e trata documentos antigos sem ativo como ativos', async () => {
    getAptidoes.mockResolvedValue([]);
    getCondicoes.mockResolvedValue([]);
    getUniversos.mockResolvedValue([
      { id: 'u1', Nome: 'Mundo A' },
      { id: 'u2', Nome: 'Mundo B', ativo: false },
    ]);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Gerenciador de Universos')).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: 'Universos' }));

    const statusFilter = await screen.findByLabelText('Status dos universos');
    await user.click(statusFilter);
    await user.click(screen.getByRole('option', { name: 'Inativos' }));

    expect(screen.getByText('Mundo B')).toBeInTheDocument();
    expect(screen.queryByText('Mundo A')).not.toBeInTheDocument();
  });

  it('bloqueia a mudança de status para não administradores', async () => {
    authState.isAdmin = false;
    getAptidoes.mockResolvedValue([]);
    getCondicoes.mockResolvedValue([]);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Gerenciador de Universos')).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: 'Universos' }));
    await user.dblClick(screen.getByText('Mundo A'));

    await waitFor(() => expect(screen.getByText('Status do universo')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Desativar universo' })).not.toBeInTheDocument();
    expect(updateUniverso).not.toHaveBeenCalled();
  });

  it('exibe a aba de exclusão com filtros, seleção e exclusão de registros', async () => {
    getAptidoes.mockResolvedValue([
      { id: 'a1', nome: 'Aptidão A', universos: ['u1'] },
      { id: 'a2', nome: 'Aptidão B', universos: ['u2'] },
    ]);
    getCondicoes.mockResolvedValue([
      { id: 'c1', nome: 'Condição A', universos: ['u1'] },
    ]);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Gerenciador de Universos')).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: 'Exclusão' }));
    await waitForDeletionTabToLoad();

    expect(screen.getByText('Aptidão A')).toBeInTheDocument();
    expect(screen.getByText('Condição A')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Categoria'));
    await user.click(screen.getByRole('option', { name: 'Aptidões' }));
    expect(screen.getByText('Aptidão A')).toBeInTheDocument();
    expect(screen.queryByText('Condição A')).not.toBeInTheDocument();

    const selectAllButton = screen.getByRole('button', { name: 'Selecionar todos' });
    await user.click(selectAllButton);
    expect(screen.getByText('1 selecionado')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Excluir selecionados' }));
    expect(screen.getByText('Confirmar exclusão')).toBeInTheDocument();
    expect(screen.getByText(/Aptidão A/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(removeAptidao).toHaveBeenCalledWith('a1'));
  });

  it('remove imediatamente da listagem local registros excluídos em categorias diferentes', () => {
    const previousData = {
      classes: [{ id: 'cl1', nome: 'Classe A' }],
      aptidoes: [{ id: 'a1', nome: 'Aptidão A' }, { id: 'a2', nome: 'Aptidão B' }],
      condicoes: [{ id: 'c1', nome: 'Condição A' }, { id: 'c2', nome: 'Condição B' }],
      racas: [{ id: 'r1', nome: 'Raça A' }],
    };

    const nextData = removeSuccessfulDeletionRecords(previousData, [
      { collection: 'classes', docId: 'cl1' },
      { collection: 'aptidoes', docId: 'a1' },
      { collection: 'condicoes', docId: 'c1' },
    ]);

    expect(nextData.classes).toEqual([]);
    expect(nextData.aptidoes).toEqual([{ id: 'a2', nome: 'Aptidão B' }]);
    expect(nextData.condicoes).toEqual([{ id: 'c2', nome: 'Condição B' }]);
    expect(nextData.racas).toEqual([{ id: 'r1', nome: 'Raça A' }]);
  });

  it('remove apenas os registros com sucesso em uma exclusão múltipla parcial e preserva os falhos', async () => {
    getClasses.mockResolvedValue([{ id: 'cl1', nome: 'Classe A', universos: ['u1'] }]);
    getAptidoes.mockResolvedValue([{ id: 'a1', nome: 'Aptidão A', universos: ['u1'] }]);
    getCondicoes.mockResolvedValue([{ id: 'c1', nome: 'Condição A', universos: ['u1'] }]);
    getMateriais.mockResolvedValue([{ id: 'm1', nome: 'Material A', universos: ['u1'] }]);

    removeClasse.mockResolvedValue(undefined);
    removeAptidao.mockRejectedValue(new Error('Falha ao remover aptidão'));
    removeCondicao.mockResolvedValue(undefined);
    removeMaterial.mockRejectedValue(new Error('Falha ao remover material'));

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Gerenciador de Universos')).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: 'Exclusão' }));
    await waitForDeletionTabToLoad();

    await user.click(screen.getByRole('checkbox', { name: 'Selecionar Classe A' }));
    await user.click(screen.getByRole('checkbox', { name: 'Selecionar Aptidão A' }));
    await user.click(screen.getByRole('checkbox', { name: 'Selecionar Condição A' }));
    await user.click(screen.getByRole('checkbox', { name: 'Selecionar Material A' }));
    await user.click(screen.getByRole('button', { name: 'Excluir selecionados' }));

    await waitFor(() => expect(screen.getByText('Confirmar exclusão')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    await waitFor(() =>
      expect(
        screen.getByText('Exclusão parcial concluída: 2 removido(s); 2 falhou(ram). Detalhes: Aptidão A (Aptidões), Material A (Materiais).'),
      ).toBeInTheDocument(),
    );

    expect(removeClasse).toHaveBeenCalledWith('cl1');
    expect(removeCondicao).toHaveBeenCalledWith('c1');
    expect(removeAptidao).toHaveBeenCalledWith('a1');
    expect(removeMaterial).toHaveBeenCalledWith('m1');

    expect(screen.queryByText('Classe A')).not.toBeInTheDocument();
    expect(screen.queryByText('Condição A')).not.toBeInTheDocument();
    expect(screen.getByText('Aptidão A')).toBeInTheDocument();
    expect(screen.getByText('Material A')).toBeInTheDocument();
    expect(screen.getByText('0 selecionados')).toBeInTheDocument();
  });

  it('preserva registros não selecionados quando a exclusão múltipla tem resultado misto', async () => {
    getClasses.mockResolvedValue([{ id: 'cl1', nome: 'Classe A', universos: ['u1'] }]);
    getAptidoes.mockResolvedValue([{ id: 'a1', nome: 'Aptidão A', universos: ['u1'] }]);
    getCondicoes.mockResolvedValue([{ id: 'c1', nome: 'Condição A', universos: ['u1'] }]);

    removeClasse.mockResolvedValue(undefined);
    removeAptidao.mockRejectedValue(new Error('Falha ao remover aptidão'));
    removeCondicao.mockResolvedValue(undefined);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Gerenciador de Universos')).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: 'Exclusão' }));
    await waitForDeletionTabToLoad();

    await user.click(screen.getByRole('checkbox', { name: 'Selecionar Classe A' }));
    await user.click(screen.getByRole('checkbox', { name: 'Selecionar Aptidão A' }));
    await user.click(screen.getByRole('button', { name: 'Excluir selecionados' }));

    await waitFor(() => expect(screen.getByText('Confirmar exclusão')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    await waitFor(() =>
      expect(
        screen.getByText('Exclusão parcial concluída: 1 removido(s); 1 falhou(ram). Detalhes: Aptidão A (Aptidões).'),
      ).toBeInTheDocument(),
    );

    expect(screen.queryByText('Classe A')).not.toBeInTheDocument();
    expect(screen.getByText('Aptidão A')).toBeInTheDocument();
    expect(screen.getByText('Condição A')).toBeInTheDocument();
    expect(screen.getByText('0 selecionados')).toBeInTheDocument();
  });

  it('mantém “Todos” no filtro de universo da aba de exclusão quando o usuário escolhe essa opção', async () => {
    getAptidoes.mockResolvedValue([
      { id: 'a1', nome: 'Aptidão A', universos: ['u1'] },
      { id: 'a2', nome: 'Aptidão B', universos: ['u2'] },
    ]);
    getCondicoes.mockResolvedValue([
      { id: 'c1', nome: 'Condição A', universos: ['u1'] },
    ]);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Gerenciador de Universos')).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: 'Exclusão' }));
    await waitForDeletionTabToLoad();

    const universeFilter = screen.getByLabelText('Universo');
    await user.click(universeFilter);
    await user.click(screen.getByRole('option', { name: 'Todos' }));

    expect(universeFilter).toHaveTextContent('Todos');
  });

  it('permite selecionar “Todos” no filtro de universo das abas de aptidões e condições', async () => {
    getAptidoes.mockResolvedValue([
      { id: 'a1', nome: 'Aptidão A', universos: ['u1'] },
      { id: 'a2', nome: 'Aptidão B', universos: ['u2'] },
    ]);
    getCondicoes.mockResolvedValue([
      { id: 'c1', nome: 'Condição A', universos: ['u1'] },
    ]);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Gerenciador de Universos')).toBeInTheDocument());

    await user.click(screen.getByRole('tab', { name: 'Aptidões' }));
    await user.click(screen.getByLabelText('Universo'));
    await user.click(screen.getByRole('option', { name: 'Todos' }));

    expect(screen.getByDisplayValue('Todos')).toBeInTheDocument();

    const itemCheckbox = screen.getByRole('button', { name: 'Selecionar aptidão Aptidão A' });
    await user.click(itemCheckbox);
    await user.click(screen.getByRole('button', { name: 'Vincular selecionados' }));

    await waitFor(() => expect(mocks.runTransaction).toHaveBeenCalledTimes(1));
    expect(mocks.transactionUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        universos: expect.arrayContaining(['u1']),
      }),
    );

    await user.click(screen.getByRole('tab', { name: 'Condições' }));
    await user.click(screen.getByLabelText('Universo'));
    await user.click(screen.getByRole('option', { name: 'Todos' }));

    expect(screen.getByDisplayValue('Todos')).toBeInTheDocument();
  });

  it('vincula a aptidão para todos os universos permitidos quando o filtro está em “Todos”', async () => {
    getAptidoes.mockResolvedValue([
      { id: 'a1', nome: 'Aptidão A', universos: [] },
      { id: 'a2', nome: 'Aptidão B', universos: ['u1'] },
    ]);
    getCondicoes.mockResolvedValue([]);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Gerenciador de Universos')).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: 'Aptidões' }));
    await user.click(screen.getByLabelText('Universo'));
    await user.click(screen.getByRole('option', { name: 'Todos' }));

    const itemButton = screen.getByRole('button', { name: 'Selecionar aptidão Aptidão A' });
    await user.click(itemButton);

    await user.click(screen.getByRole('button', { name: 'Vincular selecionados' }));

    await waitFor(() => expect(mocks.runTransaction).toHaveBeenCalledTimes(1));
    expect(mocks.transactionUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        universos: expect.arrayContaining(['u1']),
      }),
    );
  });

  it('apresenta todas as categorias do sistema no filtro da aba de exclusão', async () => {
    getAptidoes.mockResolvedValue([{ id: 'a1', nome: 'Aptidão A', universos: ['u1'] }]);
    getCondicoes.mockResolvedValue([{ id: 'c1', nome: 'Condição A', universos: ['u1'] }]);
    getClasses.mockResolvedValue?.([{ id: 'cl1', nome: 'Classe A', universos: ['u1'] }]);
    getRacas.mockResolvedValue?.([{ id: 'r1', nome: 'Raça A', universos: ['u1'] }]);
    getItens.mockResolvedValue?.([{ id: 'i1', nome: 'Item A', universos: ['u1'] }]);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Gerenciador de Universos')).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: 'Exclusão' }));
    await waitForDeletionTabToLoad();
    await user.click(screen.getByLabelText('Categoria'));

    expect(screen.getByRole('option', { name: 'Classes' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Raças' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Itens' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Aptidões' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Condições' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Universos' })).toBeInTheDocument();
  });

  it('permite pesquisar categorias e limita a altura da lista em scroll na aba de exclusão', async () => {
    getAptidoes.mockResolvedValue([{ id: 'a1', nome: 'Aptidão A', universos: ['u1'] }]);
    getCondicoes.mockResolvedValue([{ id: 'c1', nome: 'Condição A', universos: ['u1'] }]);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Gerenciador de Universos')).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: 'Exclusão' }));
    await waitForDeletionTabToLoad();

    const categoryInput = screen.getByRole('combobox', { name: 'Categoria' });
    await user.click(categoryInput);
    await user.type(categoryInput, 'ra');

    expect(screen.getByRole('option', { name: 'Raças' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Aptidões' })).not.toBeInTheDocument();

    const listbox = document.querySelector('.MuiAutocomplete-listbox');
    expect(listbox).not.toBeNull();
    expect(getComputedStyle(listbox).overflowY).toBe('auto');
    expect(parseFloat(getComputedStyle(listbox).maxHeight)).toBeGreaterThan(0);
  });

  it('cria lookup por id para a aba de exclusão sem repetir varreduras em cada registro', () => {
    const lookup = createDeletionLookupMaps({
      universos: [
        { id: 'u1', Nome: 'Mundo A' },
        { id: 'u2', Nome: 'Mundo B' },
      ],
      data: {
        aptidoes: [{ id: 'a1', nome: 'Aptidão A', universos: ['u1'] }],
        condicoes: [{ id: 'c1', nome: 'Condição A', universos: ['u2'] }],
      },
    });

    expect(lookup.universeById.get('u1')).toMatchObject({ Nome: 'Mundo A' });
    expect(lookup.itemByCollectionAndId.aptidoes.get('a1')).toMatchObject({ nome: 'Aptidão A' });
    expect(lookup.itemByCollectionAndId.condicoes.get('c1')).toMatchObject({ nome: 'Condição A' });
  });

  it('permite configurar o número de colunas da lista de exclusão', async () => {
    getAptidoes.mockResolvedValue([
      { id: 'a1', nome: 'Aptidão A', universos: ['u1'] },
      { id: 'a2', nome: 'Aptidão B', universos: ['u1'] },
    ]);
    getCondicoes.mockResolvedValue([
      { id: 'c1', nome: 'Condição A', universos: ['u1'] },
    ]);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Gerenciador de Universos')).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: 'Exclusão' }));
    await waitForDeletionTabToLoad();

    await user.click(screen.getByLabelText('Colunas'));
    await user.click(screen.getByRole('option', { name: '4 colunas' }));

    expect(screen.getByText('4 colunas')).toBeInTheDocument();
  });

  it('impede a exclusão de um universo que ainda possui dependências', async () => {
    getAptidoes.mockResolvedValue([{ id: 'a1', nome: 'Aptidão A', universos: ['u1'] }]);
    getCondicoes.mockResolvedValue([]);
    getRegras.mockResolvedValue([{ id: 'r1', nome: 'Regra A', universos: ['u1'] }]);
    getPersonagens.mockResolvedValue([{ id: 'p1', nome: 'Personagem A', universo: 'u1' }]);
    getAllRegisteredUsers.mockResolvedValue([{ uid: 'user-1', nome: 'Mestre Teste' }]);
    getUserPermissions.mockResolvedValue({ isAdmin: false, universos: ['u1'] });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Gerenciador de Universos')).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: 'Exclusão' }));
    await waitForDeletionTabToLoad();

    const selectedUniverseCard = screen.getAllByRole('button', { name: /Mundo A/i })[0];
    await user.click(selectedUniverseCard);
    await user.click(screen.getByRole('button', { name: 'Excluir selecionados' }));

    await waitFor(() => expect(screen.getByText(/dependências/i)).toBeInTheDocument());
    expect(removeUniverso).not.toHaveBeenCalled();
  });

  it('exibe a aba de universos e cria um novo universo sem recarregar a página', async () => {
    getAptidoes.mockResolvedValue([]);
    getCondicoes.mockResolvedValue([]);
    addUniverso.mockResolvedValue({
      id: 'u3',
      Nome: 'Mundo C',
      linkImagem: 'https://example.com/capa.png',
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Gerenciador de Universos')).toBeInTheDocument());

    await user.click(screen.getByRole('tab', { name: 'Universos' }));
    await user.click(screen.getByRole('button', { name: 'Criar universo' }));

    expect(screen.getByRole('dialog', { name: 'Novo universo' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Nome do universo *'), 'Mundo C');
    await user.type(screen.getByLabelText('URL da imagem de capa'), 'https://example.com/capa.png');
    await user.click(screen.getByRole('button', { name: 'Salvar universo' }));

    await waitFor(() => expect(addUniverso).toHaveBeenCalledTimes(1));
    expect(addUniverso).toHaveBeenCalledWith(
      expect.objectContaining({
        Nome: 'Mundo C',
        linkImagem: 'https://example.com/capa.png',
      }),
    );
    expect(screen.getByText('Mundo C')).toBeInTheDocument();
  });

  it('vincula múltiplos registros ao universo selecionado sem excluir outros vínculos', async () => {
    getAptidoes.mockResolvedValue([
      { id: 'a1', nome: 'Aptidão A', universos: ['u1'] },
      { id: 'a2', nome: 'Aptidão B', universos: ['u2'] },
    ]);
    getCondicoes.mockResolvedValue([
      { id: 'c1', nome: 'Condição A', universos: ['u2'] },
    ]);
    updateAptidao.mockResolvedValue(undefined);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Aptidão B')).toBeInTheDocument());

    const botaoSelecionarAptidaoB = screen.getByRole('button', {
      name: 'Selecionar aptidão Aptidão B',
    });
    await user.click(botaoSelecionarAptidaoB);

    const vincularButton = screen.getByRole('button', { name: 'Vincular selecionados' });
    await waitFor(() => expect(vincularButton).not.toBeDisabled());
    await user.click(vincularButton);

    await waitFor(() => expect(mocks.runTransaction).toHaveBeenCalledTimes(1));
    expect(mocks.transactionUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        universos: ['u2', 'u1'],
      }),
    );
    expect(mocks.transactionUpdate.mock.calls[0][1]).not.toHaveProperty('universo');
  });

  it('preserva a compatibilidade de leitura para documentos legados com apenas universo', async () => {
    getAptidoes.mockResolvedValue([
      { id: 'a1', nome: 'Aptidão Legada', universo: 'u1' },
    ]);
    getCondicoes.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Aptidão Legada')).toBeInTheDocument());
    expect(screen.getByText('1 universo')).toBeInTheDocument();
    expect(screen.getByLabelText('Universos vinculados: 1 universo')).toBeInTheDocument();
  });

  it('atualiza somente universos em documentos legados e preserva outros vínculos', async () => {
    getAptidoes.mockResolvedValue([
      { id: 'a1', nome: 'Aptidão Legada', universo: 'u1', universos: ['u2'] },
    ]);
    getCondicoes.mockResolvedValue([]);
    updateAptidao.mockResolvedValue(undefined);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Aptidão Legada')).toBeInTheDocument());

    const botaoSelecionar = screen.getByRole('button', {
      name: 'Selecionar aptidão Aptidão Legada',
    });
    await user.click(botaoSelecionar);

    const vincularButton = screen.getByRole('button', { name: 'Vincular selecionados' });
    await user.click(vincularButton);

    await waitFor(() => expect(mocks.runTransaction).toHaveBeenCalledTimes(1));
    expect(mocks.transactionUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        universos: ['u2', 'u1'],
      }),
    );
    expect(mocks.transactionUpdate.mock.calls[0][1]).not.toHaveProperty('universo');
  });

  it('reexecuta somente os registros que falharam no lote', async () => {
    getAptidoes.mockResolvedValue([
      { id: 'a1', nome: 'Aptidão A', universos: ['u2'] },
      { id: 'a2', nome: 'Aptidão B', universos: ['u2'] },
    ]);
    getCondicoes.mockResolvedValue([]);

    mocks.runTransaction
      .mockImplementationOnce(async (_, callback) => {
        const transaction = {
          get: async () => ({
            exists: () => true,
            data: () => ({ universos: ['u2'] }),
          }),
          update: vi.fn(),
        };

        return callback(transaction);
      })
      .mockImplementationOnce(async () => {
        throw new Error('falhou no segundo registro');
      });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Aptidão B')).toBeInTheDocument());

    const botaoA1 = screen.getByRole('button', { name: 'Selecionar aptidão Aptidão A' });
    const botaoA2 = screen.getByRole('button', { name: 'Selecionar aptidão Aptidão B' });

    await user.click(botaoA1);
    await user.click(botaoA2);

    const vincularButton = screen.getByRole('button', { name: 'Vincular selecionados' });
    await user.click(vincularButton);

    await waitFor(() =>
      expect(screen.getByText(/falhou no segundo registro/i)).toBeInTheDocument(),
    );

    const failedButton = screen.getByRole('button', {
      name: 'Selecionar aptidão Aptidão B',
    });
    expect(failedButton).toHaveTextContent('Selecionado');
    expect(screen.getByText(/1 registro falhou/i)).toBeInTheDocument();
  });

  it('mantém filtros independentes e combinados em cada área do gerenciador', async () => {
    getAptidoes.mockResolvedValue([
      { id: 'a1', nome: 'Espada Longa', universos: ['u1', 'u2'] },
      { id: 'a2', nome: 'Escudo', universos: ['u1'] },
      { id: 'a3', nome: 'Arco', universos: ['u2'] },
      { id: 'a4', nome: 'Flecha', universos: ['u3'] },
    ]);
    getCondicoes.mockResolvedValue([]);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Espada Longa')).toBeInTheDocument());

    const linkedSearch = screen.getByLabelText('Pesquisar vinculados');
    const availableSearch = screen.getByLabelText('Pesquisar disponíveis');

    await user.type(linkedSearch, 'Espada');
    expect(screen.getByText('Espada Longa')).toBeInTheDocument();
    expect(screen.queryByText('Escudo')).not.toBeInTheDocument();

    await user.clear(linkedSearch);
    await user.click(screen.getByRole('button', { name: /Ordenação vinculados: Z–A/i }));
    expect(screen.getByRole('button', { name: /Ordenação vinculados: Z–A/i })).toBeInTheDocument();

    await user.type(availableSearch, 'Flecha');
    expect(screen.getByText('Flecha')).toBeInTheDocument();
    expect(screen.queryByText('Arco')).not.toBeInTheDocument();

    await user.clear(availableSearch);
    await user.click(screen.getByRole('button', { name: /Ordenação disponíveis: A–Z/i }));
    expect(screen.getByRole('button', { name: /Ordenação disponíveis: A–Z/i })).toBeInTheDocument();

    const clearButtons = screen.getAllByRole('button', { name: 'Limpar' });
    await user.click(clearButtons[0]);
    expect(screen.getByLabelText('Pesquisar vinculados')).toHaveValue('');

    await user.click(clearButtons[1]);
    expect(screen.getByLabelText('Pesquisar disponíveis')).toHaveValue('');
  });

  it('mostra um resumo compacto de universos com tooltip acessível nos cards do gerenciador', async () => {
    getAptidoes.mockResolvedValue([
      { id: 'a1', nome: 'Aptidão A', universos: ['u1', 'u2'] },
    ]);
    getCondicoes.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Aptidão A')).toBeInTheDocument());
    expect(screen.getByText('2 universos')).toBeInTheDocument();
    expect(screen.getByLabelText('Universos vinculados: 2 universos')).toBeInTheDocument();
  });
});
