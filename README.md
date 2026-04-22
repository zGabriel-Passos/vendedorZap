# Vendedor Zap
#### **- Em construção**
> **Stack resumida:** `Next.js` · `React` · `TypeScript` · `Tailwind CSS` · `Baileys` · `Firebase Firestore` · `Groq (Llama 3)` · `AbacatePay` · `Axios`
<<<<<<< HEAD

![Interface atual do Vendedor Zap](assets/readme-home.png)
=======
> 
![Instrução](assets/print.jpg)
>>>>>>> ea4d938e10db9cb8f4b180bce62db7969dba5476

Agente de IA para vendas no WhatsApp com integração AbacatePay

## 🚀 Funcionalidades

- 📱 Conexão com WhatsApp via QR code
- 🛍️ Catálogo de produtos (iPhone, MacBook, AirPods...)
- 🛒 Carrinho via linguagem natural
- 💳 Pagamento via AbacatePay (PIX)
- 📦 Confirmação automática de pedido
- 🤖 IA com Groq (Llama 3) para compreensão de mensagens
- 📱 Comandos slash disponíveis: `/ajuda`, `/produtos`, `/carrinho`, `/histórico`, `/frete`, `/reset`

## 🖼️ Demo

Acesse `http://localhost:3000` após iniciar o projeto para ver a interface de conexão com WhatsApp.

## 📦 Tecnologias

- **Frontend:** Next.js 16.2.3, React 19.2.4, TypeScript, Tailwind CSS 4
- **Backend:** Baileys (WhatsApp Web API), Firebase Firestore, Groq SDK (Llama 3)
- **Integrações:** AbacatePay API (para pagamentos PIX)
- **Outros:** Axios (HTTP client), @hapi/boom (error handling)

## 🔧 Instalação

```bash
# Clone o repositório
git clone https://github.com/zGabriel-Passos/vendedorZap.git
cd vendedorZap/app

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais (Firebase, Groq, AbacatePay)
```

## 💻 Como Usar

```bash
# Inicie o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver a aplicação.

Para conectar o WhatsApp:
1. Clique em "Conectar WhatsApp"
2. Escaneie o QR code com seu WhatsApp (Dispositivos conectados → Conectar dispositivo)
3. Após a conexão, você pode usar os comandos slash no WhatsApp para interagir com o bot

## ⚙️ Configuração

Copie/Renomeie o arquivo `.env.example` para `.env` e preencha as seguintes variáveis:

```env
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=sua_chave_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_dominio_aqui
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_aqui
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_bucket_aqui
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_remetente_aqui
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id_aqui
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=seu_measurement_id_aqui

# Groq API
GROQ_API_KEY=sua_chave_groq_aqui

# AbacatePay
ABACATEPAY_API_KEY=sua_chave_abacatepay_aqui

# URL da aplicação
NEXTAUTH_URL=http://localhost:3000

# WhatsApp (opcional)
WHATSAPP_VERIFY_TOKEN=seu_token_aqui
MY_WHATSAPP_ID=seu_whatsapp_id_aqui
```

### Como obter a chave da AbacatePay

Para obter sua chave de API da AbacatePay:
1. Acesse o site [AbacatePay](https://abacatepay.com) ou a doc [Doc AbacatePay](https://docs.abacatepay.com/pages/start/welcome)
2. Crie uma conta gratuita ou faça login
3. No painel do usuário, navegue até a seção de "API" ou "Integrações"
4. Gere uma nova chave de API ou use uma existente
5. Copie a chave e cole no campo `ABACATEPAY_API_KEY` do seu arquivo `.env`

## 🧪 Testes

Este projeto atualmente não inclui testes automatizados. Para verificar o funcionamento:

1. Inicie o servidor de desenvolvimento (`npm run dev`)
2. Acesse http://localhost:3000
3. Conecte seu WhatsApp via QR code
4. Teste os comandos slash no WhatsApp

<<<<<<< HEAD
## 🤝 Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Faça commit das suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

=======
>>>>>>> ea4d938e10db9cb8f4b180bce62db7969dba5476
## 📄 Licença

Este projeto está sob a licença MIT.

## ✨ Autor

Gabriel Passos

---

*Projeto construído com Next.js e Baileys para automatização de vendas no WhatsApp.*
