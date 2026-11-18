# CC-SI-UCE4-G02-2026-2
Repositório do GRUPO 02 do Projeto UCE do 4º sem. CC/SI 2026-2. Alunos: BRENO BATISTA SILVA, HUGO BATISTA AGUIAR, JÚLIO CÉSAR BORGES DE ANDRADE PEIXOTO


# Crediário Digital
Sistema web para gerenciamento de clientes, propriedades, débitos, cobranças e pagamentos, desenvolvido como projeto da Unidade Curricular de Extensão (UCE) de Ciência da Computação / Sistemas de Informação - 2026.

O projeto é composto por uma aplicação **front-end em React** e uma **API back-end em Node.js/Express**, integrada a um banco de dados **PostgreSQL** por meio do **Prisma ORM**.

---

## Sobre o projeto
O **Crediário Digital** tem como objetivo centralizar e facilitar o controle financeiro e operacional de um escritório, permitindo o gerenciamento de clientes, propriedades, débitos e cobranças mensais.

O sistema organiza os lançamentos por cliente e competência, possibilitando acompanhar débitos em diferentes estados, gerar e administrar "notinhas", registrar pagamentos, controlar pagamentos via Pix, consultar históricos e realizar backups dos dados.
A aplicação possui diferentes níveis de acesso, com funcionalidades específicas para **administradores** e **funcionários**.

---

## Principais funcionalidades

### Autenticação e controle de acesso
O sistema possui autenticação por login e senha, com controle de sessão utilizando **JWT armazenado em cookie HTTP-only**.

Existem dois papéis de usuário:
- **Administrador** - possui acesso a todas as funcionalidades do sistema, incluindo dashboard, histórico, conferência de Pix e restauração de backups.
- **Funcionário** - possui acesso às funcionalidades operacionais do sistema, sem acesso às áreas restritas ao administrador.

As rotas da API são protegidas por middleware de autenticação, e as operações que exigem privilégios administrativos possuem uma camada adicional de autorização.

---

### Clientes
Permite cadastrar e gerenciar clientes, armazenando informações como:
- Nome;
- CPF;
- Telefone;
- Observações;
- Status;
- Honorário do escritório.

Também é possível consultar os dados detalhados de cada cliente e visualizar seu histórico.
O sistema possui busca por nome e autocomplete para facilitar a localização de clientes e evitar cadastros duplicados.

---

### Propriedades
Cada cliente pode possuir uma ou mais propriedades associadas.
Para cada propriedade podem ser registrados:
- Nome;
- Documento;
- Status;
- Cliente relacionado.

As propriedades também podem ser associadas aos débitos lançados para determinado cliente.

---

### Débitos
Os débitos representam os lançamentos financeiros do sistema.
Cada débito pode possuir:
- Cliente;
- Propriedade;
- Descrição;
- Valor;
- Competência;
- Observação;
- Status;
- Forma de pagamento;
- Data de pagamento;
- Observação do pagamento;
- Indicação de pagamento via Pix;
- Notinha relacionada.

Os débitos podem assumir os seguintes estados:
- `aberto`
- `cobrado`
- `pago`
- `cancelado`

Também existe suporte para lançamento de débitos em grupo, permitindo criar vários lançamentos de uma única vez para diferentes clientes.

---

### Notinhas
As notinhas agrupam débitos de um cliente para representar uma cobrança.
O sistema permite:
- Criar notinhas;
- Adicionar débitos a uma notinha;
- Editar notinhas;
- Consultar detalhes;
- Agrupar e visualizar notinhas;
- Registrar pagamentos totais;
- Registrar pagamentos parciais;
- Registrar pagamentos via dinheiro;
- Registrar pagamentos via Pix;
- Estornar uma notinha;
- Reabrir uma notinha;
- Consultar o histórico da notinha.

Os estados possíveis de uma notinha são:
- `ativa`
- `paga`
- `estornada`

Também existe suporte para créditos adiantados e créditos provenientes de Pix pendentes.

---

### Controle de pagamentos via Pix
O sistema possui um fluxo específico para pagamentos via Pix.
Um pagamento via Pix pode permanecer pendente de conferência antes de ser efetivamente confirmado.
Administradores possuem acesso à tela **Conferir Pix**, onde podem visualizar e confirmar pagamentos pendentes, inclusive em lote.

Esse mecanismo permite separar o registro de uma intenção/pagamento via Pix da sua efetiva confirmação no sistema.

---

### Dashboard
O dashboard apresenta métricas consolidadas do sistema, permitindo ao administrador acompanhar informações financeiras e operacionais de determinada competência.
O acesso ao dashboard é restrito a usuários com papel de administrador.

---

### Busca global
O sistema possui uma busca global que permite localizar informações relacionadas a:
- Clientes;
- Débitos;
- Notinhas.

Isso facilita a localização rápida de registros sem a necessidade de navegar manualmente por cada seção.

---

### Histórico e auditoria
As operações relevantes realizadas no sistema são registradas em um histórico.
O histórico armazena informações como:
- Data e hora;
- Entidade afetada;
- Identificação da entidade;
- Ação realizada;
- Operador responsável;
- Detalhes da operação;
- Cliente relacionado, quando aplicável.

A consulta geral do histórico é uma funcionalidade administrativa.
Além disso, o sistema permite consultar históricos específicos de clientes e notinhas.

---

### Backup e restauração
O sistema possui duas formas de exportação de dados.

A primeira gera dados detalhados preparados para exportação e utilização em planilhas.
A segunda gera um **backup completo e restaurável**, contendo os dados de negócio necessários para reconstrução do banco.

A restauração do backup:
- É restrita a administradores;
- Valida se o arquivo possui o formato esperado;
- Substitui os dados de negócio existentes;
- Mantém os usuários cadastrados e a sessão atual;
- É executada dentro de uma transação do banco de dados, evitando que uma falha deixe os dados parcialmente restaurados.

> **Atenção:** a restauração de um backup completo representa uma substituição dos dados atuais de negócio. Recomenda-se gerar um novo backup antes de realizar esse procedimento.

---

## Arquitetura do projeto
O projeto está dividido em duas aplicações principais:

```text
CC-SI-UCE4-G02-2026-2/
│
├── back-end/
│   ├── prisma/
│   ├── src/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── dto/
│   │   ├── errors/
│   │   ├── middlewares/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── bin/
│   ├── test/
│   ├── .env.example
│   ├── package.json
│   ├── prisma.config.ts
│   └── tsconfig.json
│
├── front-end/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

### Back-end
O back-end é responsável pela regra de negócio, autenticação, autorização, persistência dos dados e disponibilização da API HTTP.

A organização segue uma separação por responsabilidades:
- **Controllers** - recebem as requisições HTTP e coordenam as operações;
- **Services** - concentram regras de negócio;
- **Repositories** - responsáveis pelo acesso aos dados;
- **Routes** - definem os endpoints da API;
- **Middlewares** - autenticação, autorização e tratamento de erros;
- **DTOs** - padronização e transformação dos dados retornados pela API;
- **Database** - configuração do cliente Prisma;
- **Errors** - erros específicos da aplicação;
- **Utils** - funções auxiliares;
- **Tests** - testes automatizados da API.

### Front-end
O front-end foi desenvolvido com **React** e utiliza **Vite** como ferramenta de desenvolvimento e build.
A aplicação é organizada em páginas, componentes reutilizáveis, contextos e funções responsáveis pela comunicação com a API.
A navegação é feita utilizando **React Router**, com proteção das rotas internas e controle das telas disponíveis de acordo com o papel do usuário.

---

## Tecnologias utilizadas

### Front-end
- **React 18**
- **React DOM**
- **React Router DOM**
- **Vite**
- **Bootstrap**
- **Bootstrap Icons**
- **XLSX**

### Back-end
- **Node.js**
- **TypeScript**
- **Express 5**
- **Prisma ORM 7**
- **PostgreSQL**
- **JWT**
- **bcryptjs**
- **cookie-parser**
- **Morgan**
- **dotenv**

### Testes
O back-end possui testes automatizados utilizando o mecanismo de testes do Node.js, executados em ambiente controlado por `NODE_ENV=test`.

---

## Banco de dados
O sistema utiliza **PostgreSQL** como banco de dados.
O modelo de dados é gerenciado pelo **Prisma ORM** e possui as seguintes entidades principais:

```text
Usuario
   │
   └── controle de acesso

Cliente
   ├── Propriedade
   ├── Debito
   ├── Notinha
   └── Historico

Notinha
   ├── Debito
   └── Pagamento

Debito
   └── pode estar associado a uma Propriedade e a uma Notinha
```

As principais entidades são:
- `Usuario`
- `Cliente`
- `Propriedade`
- `Debito`
- `Notinha`
- `Pagamento`
- `Historico`

Os estados de débitos e notinhas são controlados por enums definidos no schema do Prisma.

---

## Pré-requisitos
Antes de executar o projeto, é necessário ter instalado:
- **Node.js**
- **npm**
- **PostgreSQL**
- **Git**

Também é necessário possuir um banco PostgreSQL disponível para a aplicação.
Recomenda-se utilizar uma versão recente do Node.js compatível com as dependências presentes nos arquivos `package.json`.

---

# Instalação e configuração

## 1. Clone o repositório
```bash
git clone <URL_DO_REPOSITORIO>
cd CC-SI-UCE4-G02-2026-2
```

---

## 2. Configure o banco PostgreSQL
Crie um banco de dados para o projeto.

Por exemplo:
```text
caderno_digital
```

Também é recomendável criar um banco separado para os testes:
```text
caderno_digital_test
```

O usuário utilizado pelo PostgreSQL deve possuir permissão para acessar e alterar esses bancos.

---

## 3. Configure as variáveis de ambiente do back-end
Entre na pasta do back-end:
```bash
cd back-end
```

Crie o arquivo `.env` a partir do exemplo:
```bash
copy .env.example .env
```

No Linux/macOS:
```bash
cp .env.example .env
```

Configure o arquivo `.env`:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/caderno_digital?schema=public"
TEST_DATABASE_URL="postgresql://usuario:senha@localhost:5432/caderno_digital_test?schema=public"
PORT=8888
JWT_SECRET="uma-chave-secreta-forte"
```

Substitua `usuario` e `senha` pelas credenciais do seu PostgreSQL.
A variável `JWT_SECRET` deve possuir um valor secreto e não deve ser compartilhada ou versionada no Git.

> O arquivo `.env` não deve ser enviado ao repositório. Utilize o `.env.example` apenas como referência para a configuração.

---

## 4. Instale as dependências do back-end
Ainda dentro de `back-end`:
```bash
npm install
```

---

## 5. Gere o cliente Prisma
Execute:
```bash
npm run db:generate
```

Esse comando gera o cliente Prisma utilizado pela aplicação.

---

## 6. Execute as migrations
Para aplicar as migrations existentes no banco configurado:
```bash
npm run db:migrate
```

---

## 7. Crie os usuários iniciais
Execute o seed:
```bash
npm run db:seed
```

O seed cria, caso ainda não existam, dois usuários para testes:

### Administrador
```text
Login: admin
Senha: admin123
Papel: administrador
```

### Funcionário
```text
Login: funcionario
Senha: 123456
Papel: funcionario
```

> Essas credenciais são destinadas ao ambiente de desenvolvimento/testes. Em um ambiente real, as senhas devem ser alteradas e não devem ser mantidas como credenciais padrão.

---

# Executando o projeto
O front-end e o back-end são executados separadamente.

## 1. Inicie o back-end
Na pasta `back-end`:
```bash
npm run dev
```

Por padrão, o servidor será iniciado em:
```text
http://localhost:8888
```

Também existe um endpoint de verificação da API:
```text
GET /health
```

Quando o servidor estiver funcionando corretamente, esse endpoint retorna:
```json
{
  "status": "ok"
}
```

---

## 2. Inicie o front-end
Abra outro terminal e entre na pasta:
```bash
cd front-end
```

Instale as dependências:
```bash
npm install
```

Depois execute:
```bash
npm run dev
```

O Vite exibirá no terminal o endereço local para acesso à aplicação.
Durante o desenvolvimento, o front-end utiliza o proxy configurado no Vite para encaminhar as chamadas `/api` para o back-end.

A configuração padrão permite que o front-end utilize:
```text
/api
```
como endereço da API.

Também é possível definir outro endereço utilizando a variável:
```env
VITE_API_URL
```
caso o front-end seja executado em uma infraestrutura diferente do back-end.

---

# Fluxo básico de utilização
Após iniciar as duas aplicações:

1. Acesse o endereço disponibilizado pelo Vite.
2. Faça login com um dos usuários cadastrados.
3. O usuário será direcionado para a área principal do sistema.
4. A partir dela, é possível acessar as funcionalidades permitidas pelo seu papel.
5. Cadastre clientes e suas propriedades.
6. Lance débitos para os clientes.
7. Agrupe débitos em notinhas quando necessário.
8. Registre os pagamentos realizados.
9. Utilize a conferência de Pix quando houver pagamentos pendentes.
10. Consulte o histórico e as informações consolidadas conforme o nível de acesso.
11. Utilize a área de backup para exportar ou, quando necessário, restaurar os dados.

---

# Rotas principais da API
A API possui endpoints organizados por recurso.

| Recurso | Prefixo |
|---|---|
| Autenticação | `/auth` |
| Clientes | `/clientes` |
| Propriedades | `/propriedades` |
| Débitos | `/debitos` |
| Notinhas | `/notinhas` |
| Pix pendentes | `/pix-pendentes` |
| Dashboard | `/dashboard` |
| Histórico | `/historico` |
| Busca global | `/busca` |
| Backup | `/backup` |
| Health check | `/health` |

As rotas de negócio, com exceção das rotas públicas de autenticação e do health check, exigem uma sessão autenticada.

---

# Segurança
O sistema possui alguns mecanismos de segurança implementados no back-end:
- Senhas armazenadas utilizando hash com `bcryptjs`;
- Autenticação baseada em JWT;
- JWT armazenado em cookie `HTTP-only`;
- Verificação da sessão no back-end;
- Middleware de autenticação para proteção das rotas;
- Middleware específico para operações exclusivas de administradores;
- Separação entre autenticação e autorização;
- Tratamento centralizado de erros;
- Variáveis sensíveis mantidas em `.env`.

O controle de acesso é realizado no back-end, evitando que a segurança dependa exclusivamente da interface do front-end.
O front-end também protege as rotas visualmente de acordo com o papel do usuário, proporcionando uma experiência adequada para cada perfil.

---

# Scripts disponíveis

## Back-end
Dentro da pasta `back-end`:

| Comando | Função |
|---|---|
| `npm run dev` | Inicia o servidor em modo desenvolvimento com recarregamento automático |
| `npm start` | Executa a versão compilada da aplicação |
| `npm run build` | Gera o cliente Prisma e compila o TypeScript |
| `npm run db:generate` | Gera o cliente Prisma |
| `npm run db:migrate` | Aplica as migrations do banco |
| `npm run db:studio` | Abre o Prisma Studio |
| `npm run db:seed` | Executa os dados iniciais |
| `npm test` | Executa os testes automatizados |

## Front-end

Dentro da pasta `front-end`:
| Comando | Função |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento do Vite |
| `npm run build` | Gera a versão de produção |
| `npm run preview` | Executa uma prévia da versão de produção |

---

# Testes
Os testes automatizados estão localizados em:
```text
back-end/test/
```

Atualmente existem testes relacionados a diferentes áreas da aplicação, incluindo:
- Autenticação;
- Clientes;
- Débitos;
- Notinhas;
- Pagamentos;
- Administração.

Para executá-los:
```bash
cd back-end
npm test
```

Os testes são executados com `NODE_ENV=test` e utilizam a configuração de banco de testes definida pela variável `TEST_DATABASE_URL`.

---

# Estrutura de desenvolvimento
O projeto utiliza uma arquitetura em camadas no back-end.

De forma simplificada, uma requisição segue o seguinte fluxo:
```text
Front-end
    │
    ▼
Routes
    │
    ▼
Middleware
    │
    ▼
Controller
    │
    ▼
Service
    │
    ▼
Repository
    │
    ▼
Prisma
    │
    ▼
PostgreSQL
```

Essa separação facilita a manutenção do código e permite que responsabilidades diferentes permaneçam isoladas.
No front-end, a aplicação é dividida entre páginas, componentes reutilizáveis, contextos e funções de comunicação com a API.

---

# Principais páginas do sistema

O front-end possui as seguintes áreas principais:
- **Login**
- **Essencial**
- **Clientes**
- **Detalhes do cliente**
- **Notinhas**
- **Nova notinha**
- **Detalhes da notinha**
- **Edição de notinha**
- **Notinhas agrupadas**
- **Conferir Pix**
- **Dashboard**
- **Busca global**
- **Histórico**
- **Backup**

O acesso a determinadas páginas é condicionado ao papel do usuário.
As áreas de **Dashboard**, **Histórico** e **Conferir Pix** são restritas ao administrador.

---

# Banco de dados e Prisma
O schema do banco encontra-se em:
```text
back-end/prisma/schema.prisma
```

As migrations ficam em:
```text
back-end/prisma/migrations/
```

O projeto utiliza Prisma para:
- Definir o modelo de dados;
- Gerar o cliente de acesso ao banco;
- Executar migrations;
- Facilitar consultas e transações;
- Trabalhar com relacionamentos entre as entidades.

Para visualizar o banco utilizando a interface do Prisma:
```bash
npm run db:studio
```

---

# Observações importantes

O projeto possui uma separação clara entre os ambientes de desenvolvimento e os dados persistidos no PostgreSQL.

O arquivo `.env` contém informações específicas do ambiente e deve permanecer fora do controle de versão.

O arquivo `.env.example` deve ser utilizado como modelo para que outros desenvolvedores saibam quais variáveis precisam ser configuradas.

Antes de executar o projeto pela primeira vez, é necessário garantir que:
- O PostgreSQL esteja em execução;
- O banco de dados esteja criado;
- As credenciais estejam corretas;
- O arquivo `.env` esteja configurado;
- As dependências tenham sido instaladas;
- As migrations tenham sido aplicadas;
- O seed tenha sido executado, caso sejam necessários os usuários iniciais.

---

# Equipe
Projeto desenvolvido pelo **Grupo 02**, como parte do Projeto UCE do 4º semestre de Ciência da Computação / Sistemas de Informação - 2026/2.

- **Breno Batista Silva**
- **Hugo Batista Aguiar**
- **Júlio César Borges Andrade Peixoto**

---

## Licença
Este projeto foi desenvolvido para fins acadêmicos no contexto da Unidade Curricular de Extensão (UCE).
Não foi definida uma licença de software específica no repositório, até o momento.
