# Guia de APIs e Configuracao

Este guia mostra como obter as chaves necessarias para rodar o projeto localmente.

## Antes de comecar

1. Entre na pasta `app`.
2. Renomeie ou copie `.env.example` para `.env`.
3. Preencha as variaveis com os dados obtidos neste guia.

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

No macOS/Linux:

```bash
cp .env.example .env
```

## Variaveis que voce vai precisar

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
GROQ_API_KEY=
ABACATEPAY_API_KEY=
NEXTAUTH_URL=http://localhost:3000
WHATSAPP_VERIFY_TOKEN=
MY_WHATSAPP_ID=
```

## Firebase

O projeto usa Firebase para persistir dados no Firestore.

### Como criar ou abrir um projeto

1. Acesse `https://console.firebase.google.com/`.
2. Clique em `Adicionar projeto` ou abra um projeto existente.
3. Siga o fluxo de criacao do projeto.

### Como pegar as chaves do app web

1. Dentro do projeto, clique na engrenagem e va em `Configuracoes do projeto`.
2. Na secao `Seus apps`, crie um app do tipo `Web` se ainda nao existir.
3. Depois de criar, o Firebase mostra um bloco parecido com:

```js
const firebaseConfig = {
  apiKey: "..."
  authDomain: "..."
  projectId: "..."
  storageBucket: "..."
  messagingSenderId: "..."
  appId: "..."
  measurementId: "..."
}
```

4. Copie cada valor para o seu `.env`.

### Mapeamento para o `.env`

```env
NEXT_PUBLIC_FIREBASE_API_KEY=apiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=authDomain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=projectId
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=storageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=messagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID=appId
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=measurementId
```

### Firestore

1. No menu lateral, entre em `Firestore Database`.
2. Clique em `Criar banco de dados`.
3. Escolha o modo e a regiao.
4. Garanta que o projeto tenha o Firestore habilitado antes de testar a aplicacao.

## Groq

O projeto usa a Groq para interpretar mensagens do WhatsApp.

### Como pegar a API key

1. Acesse `https://console.groq.com/`.
2. Crie sua conta ou faca login.
3. Procure a area de `API Keys`.
4. Gere uma nova chave.
5. Copie e cole no `.env`:

```env
GROQ_API_KEY=sua_chave_aqui
```

### Observacao

- Essa chave e privada. Nao publique no GitHub.

## AbacatePay

O projeto usa a AbacatePay para gerar links de pagamento PIX.

### Como pegar a API key

1. Acesse `https://abacatepay.com/`.
2. Entre na sua conta.
3. No painel, procure a area de API, desenvolvedor ou integracoes.
4. Gere uma chave de API.
5. Copie e cole no `.env`:

```env
ABACATEPAY_API_KEY=sua_chave_aqui
```

### O que conferir depois

- Se a chave esta ativa.
- Se sua conta esta no ambiente esperado.
- Se os links de retorno usam a URL correta da sua aplicacao.

## Outras variaveis do projeto

### `NEXTAUTH_URL`

Apesar do nome, esta variavel esta sendo usada como URL base da aplicacao para callbacks e redirecionamentos da AbacatePay.

Em desenvolvimento:

```env
NEXTAUTH_URL=http://localhost:3000
```

Em producao:

```env
NEXTAUTH_URL=https://seu-dominio.com
```

### `MY_WHATSAPP_ID`

Define qual numero pode conversar com o bot.

Use apenas numeros, com DDI e DDD:

```env
MY_WHATSAPP_ID=5511999999999
```

### `WHATSAPP_VERIFY_TOKEN`

E opcional neste projeto.

Use se voce for trabalhar com verificacao da rota:

`app/api/webhook/whatsapp/route.ts`

Exemplo:

```env
WHATSAPP_VERIFY_TOKEN=token_seguro_qualquer
```

## Checklist final

1. Criou o `.env` a partir do `.env.example`.
2. Preencheu as chaves do Firebase.
3. Preencheu `GROQ_API_KEY`.
4. Preencheu `ABACATEPAY_API_KEY`.
5. Ajustou `MY_WHATSAPP_ID`.
6. Confirmou `NEXTAUTH_URL`.
7. Rodou `npm install`.
8. Rodou `npm run dev`.

## Arquivos de apoio

- `.env.example`: modelo de variaveis.
- `README.md`: visao geral de setup e execucao.
