/* ==========================================================================
   CAMADA DE DADOS — ponte entre as telas e o back-end (API REST)
   --------------------------------------------------------------------------
   Este arquivo continua sendo a ÚNICA parte do front-end que sabe "onde os
   dados moram". Cada função chama a API do back-end (Node.js + Express + Prisma + PostgreSQL).

   Os nomes e parâmetros de todas as funções exportadas são exatamente os
   mesmos de antes, por isso NENHUMA tela precisou mudar. Todas as regras de
   negócio (status, cálculo de dinheiro, permissões) agora vivem no
   back-end — aqui só montamos a requisição e devolvemos a resposta.

   Detalhes importantes:
   - O login fica num cookie httpOnly que o próprio navegador manda em toda
     requisição (`credentials: 'include'`). O front nunca vê o token.
   - Em desenvolvimento, o Vite redireciona `/api/...` para o back-end
     (veja `server.proxy` no vite.config.js), então front e API parecem
     estar no mesmo endereço e o cookie funciona sem configurar CORS.
   - O banco usa ids numéricos, mas as telas foram escritas comparando ids
     como texto (ex.: o id que vem da URL). Por isso todo id que chega da API
     é convertido para texto em `normalizarIds` — a API aceita os dois.
   ========================================================================== */

// Endereço base da API. Pode ser trocado pela variável VITE_API_URL (ex.:
// num build de produção servido em outro domínio).
const URL_API = (import.meta.env?.VITE_API_URL || '/api').replace(/\/$/, '')

// Formata a competência atual do sistema no padrão MM/AAAA.
export function competenciaAtual() {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  return `${mes}/${d.getFullYear()}`
}

/* --------------------------------------------------------------------------
   Utilidades internas
   -------------------------------------------------------------------------- */

// Converte para texto todo campo que seja um id (`id`, `clienteId`,
// `notinhaId`...) ou uma lista de ids (`ids`, `debitoIds`...), em qualquer
// nível do objeto. Assim `d.id === idDaUrl` continua funcionando nas telas.
function normalizarIds(valor) {
  if (Array.isArray(valor)) return valor.map(normalizarIds)
  if (!valor || typeof valor !== 'object') return valor
  const saida = {}
  for (const [chave, v] of Object.entries(valor)) {
    const ehId = chave === 'id' || /Id$/.test(chave)
    const ehListaDeIds = chave === 'ids' || /Ids$/.test(chave)
    if (ehId && typeof v === 'number') saida[chave] = String(v)
    else if (ehListaDeIds && Array.isArray(v)) saida[chave] = v.map((x) => (typeof x === 'number' ? String(x) : x))
    else saida[chave] = normalizarIds(v)
  }
  return saida
}

// Monta a query string ignorando parâmetros vazios/nulos.
function query(params = {}) {
  const qs = new URLSearchParams()
  for (const [chave, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue
    qs.append(chave, String(v))
  }
  const texto = qs.toString()
  return texto ? `?${texto}` : ''
}

// Faz a chamada HTTP e devolve o JSON da resposta (já com ids normalizados).
// Erros da API chegam como `{ erro: '...' }` e viram um `Error` com essa
// mensagem — as telas já mostram `erro.message` num toast.
async function api(metodo, caminho, corpo) {
  let resposta
  try {
    resposta = await fetch(`${URL_API}${caminho}`, {
      method: metodo,
      credentials: 'include',
      headers: corpo !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    })
  } catch {
    throw new Error('Não foi possível falar com o servidor. Verifique se o back-end está rodando e tente de novo.')
  }

  if (resposta.status === 204) return null

  let dados = null
  const texto = await resposta.text()
  if (texto) {
    try {
      dados = JSON.parse(texto)
    } catch {
      dados = null
    }
  }

  if (!resposta.ok) {
    if (resposta.status === 401 && caminho !== '/auth/login') {
      throw new Error('Sua sessão expirou. Saia e entre novamente.')
    }
    throw new Error(dados?.erro || `Erro ${resposta.status} ao falar com o servidor.`)
  }
  return normalizarIds(dados)
}

const get = (caminho) => api('GET', caminho)
const post = (caminho, corpo = {}) => api('POST', caminho, corpo)
const patch = (caminho, corpo = {}) => api('PATCH', caminho, corpo)

/* --------------------------------------------------------------------------
   Histórico / auditoria
   -------------------------------------------------------------------------- */

export async function listarHistorico({ entidade = 'todas', operador = '' } = {}) {
  return get(`/historico${query({ entidade, operador })}`)
}

// Linha do tempo de uma notinha específica (gerada, pagamentos, quitação,
// estorno) — mostrada na própria tela de detalhe da notinha.
export async function listarHistoricoDaNotinha(notinhaId) {
  return get(`/notinhas/${notinhaId}/historico`)
}

// Linha do tempo de um cliente específico (usada na ficha do cliente).
export async function listarHistoricoDoCliente(clienteId) {
  return get(`/clientes/${clienteId}/historico`)
}

/* --------------------------------------------------------------------------
   Autenticação
   -------------------------------------------------------------------------- */

export async function entrar(login, senha) {
  return post('/auth/login', { login: String(login).trim(), senha })
}

export async function sair() {
  await post('/auth/logout')
}

// Devolve o usuário logado ou `null`. Nunca lança erro: sem sessão (401) ou
// com o servidor fora do ar, a tela de login simplesmente aparece.
export async function usuarioAtual() {
  try {
    return await get('/auth/me')
  } catch {
    return null
  }
}

/* --------------------------------------------------------------------------
   Clientes
   -------------------------------------------------------------------------- */

export async function listarClientes({ busca = '', status = 'todos' } = {}) {
  return get(`/clientes${query({ busca, status })}`)
}

// Usada pelo autocomplete: procura clientes com nome parecido, para evitar
// cadastro duplicado e para ajudar a digitar mais rápido.
export async function buscarClientesPorNome(texto, limite = 8) {
  if (!texto || !texto.trim()) return []
  const lista = await get(`/clientes/buscar-por-nome${query({ texto: texto.trim() })}`)
  return lista.slice(0, limite)
}

export async function buscarClientePorId(id) {
  try {
    return await get(`/clientes/${id}`)
  } catch (erro) {
    if (/não encontrad/i.test(erro.message)) return null
    throw erro
  }
}

export async function criarCliente(dados) {
  return post('/clientes', dados)
}

export async function atualizarCliente(id, dados) {
  return patch(`/clientes/${id}`, dados)
}

/* --- Propriedades / filiais do cliente --- */

// Por padrão devolve só as propriedades ATIVAS. Passe `{ apenasAtivas: false }`
// para ver todas, incluindo inativas.
export async function listarPropriedades(clienteId, { apenasAtivas = true } = {}) {
  return get(`/clientes/${clienteId}/propriedades${query({ apenasAtivas })}`)
}

export async function criarPropriedade(clienteId, dados) {
  return post(`/clientes/${clienteId}/propriedades`, dados)
}

export async function atualizarPropriedade(id, dados) {
  return patch(`/propriedades/${id}`, dados)
}

/* --------------------------------------------------------------------------
   Débitos (o "caderno" — aba Essencial)
   -------------------------------------------------------------------------- */

export async function listarDebitos({
  clienteId = null,
  status = 'todos', // 'todos' | 'aberto' | 'cobrado' | 'pago' | 'cancelado'
  competencia = '',
  busca = '',
  apenasPixPendente = false,
} = {}) {
  return get(`/debitos${query({ clienteId, status, competencia, busca, apenasPixPendente: apenasPixPendente || '' })}`)
}

// A API não tem rota de débito avulso; procura na lista completa.
export async function buscarDebitoPorId(id) {
  const lista = await listarDebitos()
  return lista.find((d) => d.id === String(id)) || null
}

export async function criarDebito(dados) {
  return post('/debitos', dados)
}

// Lançamento em grupo: uma única descrição + competência, para vários
// clientes (cada um com seu próprio valor/propriedade/observação).
export async function criarDebitosEmGrupo({ descricao, competencia, linhas }) {
  return post('/debitos/lote', { descricao, competencia, linhas })
}

export async function editarDebito(id, dados) {
  return patch(`/debitos/${id}`, dados)
}

// Correção manual de status. "Pago via Pix" nunca fecha na hora — o
// back-end deixa como cobrado + Pix pendente até ser conferido.
export async function alterarStatusDebito(id, alvo, opcoes = {}) {
  return post(`/debitos/${id}/alterar-status`, { ...opcoes, alvo })
}

export async function cancelarDebito(id, motivo = '') {
  return post(`/debitos/${id}/cancelar`, { motivo })
}

export async function marcarPagoDinheiro(id, { formaPagamento = 'Dinheiro', dataPagamento = '', obs = '' } = {}) {
  return post(`/debitos/${id}/pagar-dinheiro`, { formaPagamento, dataPagamento, obs })
}

export async function marcarPagoPix(id, obs = '') {
  return post(`/debitos/${id}/pagar-pix`, { obs })
}

export async function confirmarPix(id) {
  return post(`/debitos/${id}/confirmar-pix`)
}

export async function confirmarPixEmLote(ids) {
  return post('/debitos/confirmar-pix-lote', { ids })
}

export async function confirmarCreditoPixNotinha(notinhaId) {
  return post(`/notinhas/${notinhaId}/confirmar-credito-pix`)
}

// Fila da tela "Conferir Pix" (só administrador): notinhas inteiras, itens
// avulsos e créditos Pix soltos, já agrupados pelo back-end.
export async function listarPixPendentes() {
  return get('/pix-pendentes')
}

/* --------------------------------------------------------------------------
   Notinhas
   -------------------------------------------------------------------------- */

export async function listarNotinhas({ busca = '', competencia = '', status = 'todas' } = {}) {
  return get(`/notinhas${query({ busca, competencia, status })}`)
}

export async function buscarNotinhaPorId(id) {
  try {
    return await get(`/notinhas/${id}`)
  } catch (erro) {
    if (/não encontrad/i.test(erro.message)) return null
    throw erro
  }
}

export async function criarNotinha(dados) {
  return post('/notinhas', dados)
}

export async function atualizarNotinha(id, dados = {}) {
  return patch(`/notinhas/${id}`, dados)
}

export async function adicionarDebitosNaNotinha(notinhaId, debitoIds) {
  return post(`/notinhas/${notinhaId}/adicionar-debitos`, { debitoIds })
}

export async function pagarNotinhaTotalDinheiro(id) {
  return post(`/notinhas/${id}/pagar-tudo-dinheiro`)
}

export async function pagarNotinhaTotalPix(id, obs = '') {
  return post(`/notinhas/${id}/pagar-tudo-pix`, { obs })
}

export async function pagarNotinhaParcial(id, { valor, forma = 'Dinheiro', data = '', obs = '' }) {
  return post(`/notinhas/${id}/pagar-parcial`, { valor, forma, data, obs })
}

export async function estornarNotinha(id, motivo = '') {
  return post(`/notinhas/${id}/estornar`, { motivo })
}

export async function reabrirNotinha(id, motivo = '') {
  return post(`/notinhas/${id}/reabrir`, { motivo })
}

/* --------------------------------------------------------------------------
   Dashboard e busca global
   -------------------------------------------------------------------------- */

export async function obterMetricasDashboard(competencia) {
  return get(`/dashboard${query({ competencia })}`)
}

export async function buscaGlobal(texto) {
  if (!texto || !texto.trim()) return { clientes: [], debitos: [], notinhas: [] }
  return get(`/busca${query({ texto: texto.trim() })}`)
}

/* --------------------------------------------------------------------------
   Backup
   -------------------------------------------------------------------------- */

// Dados "achatados" e com nomes resolvidos, prontos para planilha .xlsx.
export async function obterDadosParaExportacao() {
  return get('/backup/exportar-detalhado')
}

// Backup "de verdade" (dados brutos), que pode ser restaurado depois.
export async function exportarBackupCompleto() {
  return get('/backup/exportar')
}

// Restaura um backup gerado pela função acima (só administrador). O
// back-end não mexe nos usuários, então ninguém perde o próprio login.
export async function restaurarBackupCompleto(dados) {
  await post('/backup/restaurar', dados)
}
