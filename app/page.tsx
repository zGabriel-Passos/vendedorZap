"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Status = "disconnected" | "connecting" | "qr" | "connected" | "error";

type IconProps = {
  className?: string;
};

const navLinks = [
  { href: "#conexao", label: "Conexao" },
  { href: "#beneficios", label: "Beneficios" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#faq", label: "FAQ" },
];

const painPoints = [
  "Leads esfriam porque a resposta demora nos horarios de pico.",
  "Carrinho e pagamento quebram quando a conversa fica solta no WhatsApp.",
  "O time repete sempre as mesmas perguntas sobre produto, frete e estoque.",
];

const featureCards = [
  {
    title: "Atendimento que fecha pedido",
    description: "O bot entende linguagem natural, monta o carrinho e conduz a conversa ate o checkout.",
    icon: BrainIcon,
  },
  {
    title: "QR code em segundos",
    description: "Conecte o numero pelo painel, acompanhe o status em tempo real e troque de sessao sem dor.",
    icon: QrIcon,
  },
  {
    title: "PIX com AbacatePay",
    description: "Gere cobranca dentro do fluxo e reduza abandono na reta final da compra.",
    icon: WalletIcon,
  },
  {
    title: "Catalogo pronto para vender",
    description: "Apresente iPhone, MacBook, AirPods e outros produtos sem depender de atendimento manual.",
    icon: BoxIcon,
  },
  {
    title: "Comandos rapidos para suporte",
    description: "Slash commands ajudam o operador a checar produtos, carrinho, historico e reset rapidamente.",
    icon: SparkIcon,
  },
  {
    title: "Operacao mais previsivel",
    description: "Status visual, conexao persistente e fluxo claro para evitar apagao em horario critico.",
    icon: PulseIcon,
  },
];

const steps = [
  {
    index: "01",
    title: "Conecte o WhatsApp",
    description: "Inicie a sessao, escaneie o QR code e ative o numero que vai vender.",
  },
  {
    index: "02",
    title: "Deixe o bot atender",
    description: "A IA identifica intencao, responde duvidas, sugere produto e monta o carrinho.",
  },
  {
    index: "03",
    title: "Receba o pagamento",
    description: "O cliente paga por PIX e o pedido segue com confirmacao automatica.",
  },
];

const faqs = [
  {
    question: "Preciso instalar algo no celular?",
    answer:
      "Nao. Basta usar o fluxo padrao do WhatsApp em Dispositivos conectados para escanear o QR code.",
  },
  {
    question: "Posso cancelar uma conexao em andamento?",
    answer:
      "Sim. Enquanto o QR estiver ativo, o botao de cancelar encerra a sessao e volta o painel ao estado inicial.",
  },
  {
    question: "O pagamento PIX faz parte do fluxo?",
    answer:
      "Sim. O app foi pensado para gerar cobranca via AbacatePay dentro da conversa, reduzindo abandono no checkout.",
  },
  {
    question: "Quais comandos o time pode usar no WhatsApp?",
    answer:
      "Os atalhos atuais incluem /ajuda, /produtos, /carrinho, /historico, /frete e /reset.",
  },
];

export default function Home() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("disconnected");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const statusLabel: Record<Status, string> = {
    disconnected: "Pronto para conectar",
    connecting: "Abrindo sessao...",
    qr: "Aguardando leitura do QR code",
    connected: "WhatsApp conectado",
    error: "Falha ao conectar",
  };

  function closeSSE() {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  }

  const handleConnect = () => {
    setStatus("connecting");
    setQrCode(null);
    closeSSE();

    const es = new EventSource("/api/whatsapp/connect");
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status) setStatus(data.status as Status);
      if (data.qr) {
        setQrCode(
          `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(data.qr)}`
        );
      }
      if (data.status === "connected") {
        setQrCode(null);
        closeSSE();
      }
    };

    es.onerror = () => {
      setStatus("error");
      closeSSE();
    };
  };

  const handleDisconnect = async () => {
    closeSSE();
    await fetch("/api/whatsapp/disconnect", { method: "POST" });
    setQrCode(null);
    setStatus("disconnected");
  };

  useEffect(() => () => closeSSE(), []);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const isConnected = status === "connected";
  const isConnecting = status === "connecting" || status === "qr";
  const statusTone = isConnected
    ? "border-emerald-300/70 bg-emerald-500/12 text-emerald-100"
    : isConnecting
      ? "border-amber-300/70 bg-amber-400/12 text-amber-50"
      : status === "error"
        ? "border-rose-300/70 bg-rose-500/12 text-rose-100"
        : "border-white/15 bg-white/8 text-white";

  return (
    <div className="relative overflow-x-clip bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,122,24,0.24),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(23,188,158,0.22),_transparent_30%),linear-gradient(180deg,_rgba(255,255,255,0.02),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.06]" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(8,14,20,0.72)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <a href="#top" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/8 shadow-[0_14px_40px_rgba(0,0,0,0.28)]">
              <SparkIcon className="h-5 w-5 text-[var(--color-accent)]" />
            </div>
            <div>
              <p className="font-display text-lg leading-none text-white">Vendedor Zap</p>
              <p className="text-xs uppercase tracking-[0.28em] text-white/55">WhatsApp Commerce OS</p>
            </div>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-white/72 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href="#painel"
              className="rounded-full border border-white/12 px-5 py-3 text-sm font-medium text-white/86 transition hover:border-white/20 hover:bg-white/6"
            >
              Ver painel
            </a>
            <button
              onClick={handleConnect}
              className="rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-bg)] shadow-[0_12px_32px_rgba(255,122,24,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(255,122,24,0.42)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
            >
              Conectar agora
            </button>
          </div>

          <button
            type="button"
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white transition hover:bg-white/10 md:hidden"
          >
            <div className="flex flex-col gap-1.5">
              <span
                className={`h-0.5 w-5 rounded-full bg-current transition ${mobileMenuOpen ? "translate-y-2 rotate-45" : ""}`}
              />
              <span className={`h-0.5 w-5 rounded-full bg-current transition ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span
                className={`h-0.5 w-5 rounded-full bg-current transition ${mobileMenuOpen ? "-translate-y-2 -rotate-45" : ""}`}
              />
            </div>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[rgba(10,18,24,0.96)] px-5 py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-2xl border border-white/8 px-4 py-3 text-sm text-white/84 transition hover:bg-white/6"
                >
                  {link.label}
                </a>
              ))}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleConnect();
                }}
                className="rounded-2xl bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-[var(--color-bg)]"
              >
                Conectar WhatsApp
              </button>
            </nav>
          </div>
        )}
      </header>

      <main id="top">
        <section className="relative mx-auto min-h-[calc(100vh-80px)] w-full max-w-7xl px-5 py-16 md:px-8 lg:py-24">
          <div data-reveal className="reveal flex flex-col gap-8">
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/72">
                IA + WhatsApp + PIX
              </span>
              <span className="rounded-full border border-[rgba(255,122,24,0.25)] bg-[rgba(255,122,24,0.12)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-soft)]">
                Fluxo visual em tempo real
              </span>
            </div>

            <div className="max-w-3xl">
              <p className="mb-4 text-sm uppercase tracking-[0.28em] text-[var(--color-accent-soft)]">
                Atendimento comercial para operacao que nao pode travar
              </p>
              <h1 className="font-display text-5xl leading-[0.92] text-white sm:text-6xl lg:text-7xl">
                Conecte o WhatsApp e deixe o bot vender.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-text-muted)]">
                Uma landing page direta para ligar sua operacao, captar pedidos e cobrar por PIX sem afundar a equipe em atendimento repetitivo.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleConnect}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--color-accent)] px-7 py-4 text-sm font-semibold text-[var(--color-bg)] shadow-[0_16px_40px_rgba(255,122,24,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_52px_rgba(255,122,24,0.44)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
              >
                Iniciar conexao
              </button>
              <a
                href="#conexao"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-7 py-4 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Ver conexao
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Tempo de setup", value: "< 1 min" },
                { label: "Fluxos centrais", value: "Atendimento, carrinho, PIX" },
                { label: "Comandos rapidos", value: "6 atalhos prontos" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.75rem] border border-white/10 bg-white/6 px-5 py-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-white/16 hover:bg-white/10"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-white/48">{item.label}</p>
                  <p className="mt-3 text-base font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="conexao" className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div data-reveal className="reveal max-w-2xl">
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-accent-soft)]">Conexao com WhatsApp</p>
              <h2 className="mt-4 font-display text-4xl text-white md:text-5xl">Uma secao dedicada para ativar seu numero sem distracao.</h2>
              <p className="mt-5 text-lg leading-8 text-[var(--color-text-muted)]">
                Aqui fica so o fluxo de conexao: status, QR code, comandos e acoes principais. O resto da landing explica o produto, esta secao coloca ele no ar.
              </p>
              <div className="mt-8 grid gap-3">
                {[
                  "Atualizacao em tempo real do status da sessao",
                  "QR code com leitura guiada para o celular",
                  "Cancelamento e desconexao com um clique",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/74">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(23,188,158,0.16)] text-[var(--color-secondary)]">
                      <CheckIcon className="h-4 w-4" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div id="painel" data-reveal className="reveal lg:justify-self-end">
              <div className="relative mx-auto max-w-xl">
              <div className="absolute -left-8 top-14 hidden h-28 w-28 rounded-full bg-[rgba(255,122,24,0.24)] blur-3xl md:block" />
              <div className="absolute -right-8 bottom-16 hidden h-32 w-32 rounded-full bg-[rgba(23,188,158,0.22)] blur-3xl md:block" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(12,19,26,0.92),rgba(8,12,18,0.98))] p-5 shadow-[0_32px_90px_rgba(0,0,0,0.36)]">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-white/45">Painel ao vivo</p>
                    <h2 className="mt-2 font-display text-2xl text-white">Central de conexao</h2>
                  </div>
                  <div className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${statusTone}`}>
                    {statusLabel[status]}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-white/56">Sessao WhatsApp</p>
                        <p className="mt-2 text-xl font-semibold text-white">
                          {isConnected ? "Operacao online" : isConnecting ? "Ligando canal" : "Aguardando inicio"}
                        </p>
                      </div>
                      <span
                        className={`mt-1 inline-flex h-3.5 w-3.5 rounded-full ${
                          isConnected
                            ? "bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.7)]"
                            : isConnecting
                              ? "bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.7)] animate-pulse"
                              : status === "error"
                                ? "bg-rose-400 shadow-[0_0_20px_rgba(251,113,133,0.7)]"
                                : "bg-white/28"
                        }`}
                      />
                    </div>

                    <div className="mt-5 grid gap-3">
                      {[
                        "Status visual com atualizacao em tempo real",
                        "Fluxo de QR code sem sair da pagina",
                        "Botao de cancelamento e desconexao visiveis",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/10 px-4 py-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(23,188,158,0.16)] text-[var(--color-secondary)]">
                            <CheckIcon className="h-4 w-4" />
                          </span>
                          <p className="text-sm text-white/72">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5">
                    <p className="text-sm text-white/56">Comandos ativos</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {["/ajuda", "/produtos", "/carrinho", "/historico", "/frete", "/reset"].map((cmd) => (
                        <span
                          key={cmd}
                          className="rounded-full border border-white/10 bg-black/18 px-3 py-2 font-mono text-xs text-white/76"
                        >
                          {cmd}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 rounded-2xl border border-[rgba(255,122,24,0.22)] bg-[rgba(255,122,24,0.08)] p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent-soft)]">Pronto para vender</p>
                      <p className="mt-2 text-sm leading-6 text-white/76">
                        Catalogo, carrinho e pagamento desenhados para conversa comercial sem atrito.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5">
                  {status === "qr" && qrCode ? (
                    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
                      <div className="mx-auto rounded-[1.5rem] bg-white p-4 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
                        <Image
                          src={qrCode}
                          alt="QR Code para conectar o WhatsApp"
                          width={240}
                          height={240}
                          className="h-auto w-full"
                          unoptimized
                        />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent-soft)]">Escaneie agora</p>
                        <h3 className="mt-3 font-display text-3xl text-white">Abra o WhatsApp e conecte este numero.</h3>
                        <p className="mt-3 text-sm leading-7 text-white/70">
                          No celular, acesse Dispositivos conectados, toque em Conectar dispositivo e leia o QR code exibido aqui.
                        </p>
                      </div>
                    </div>
                  ) : isConnected ? (
                    <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">Conexao confirmada</p>
                        <h3 className="mt-3 font-display text-3xl text-white">Bot ativo para responder, vender e cobrar.</h3>
                        <p className="mt-3 text-sm leading-7 text-white/72">
                          Compartilhe o numero com seus clientes e acompanhe o fluxo. O bot esta pronto para atender novas conversas.
                        </p>
                      </div>
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border border-emerald-300/35 bg-emerald-500/14 text-emerald-200">
                        <CheckIcon className="h-10 w-10" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr] md:items-center">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-white/45">Fluxo guiado</p>
                        <h3 className="mt-3 font-display text-3xl text-white">Tudo que voce precisa para conectar esta aqui.</h3>
                        <p className="mt-3 text-sm leading-7 text-white/70">
                          Inicie a sessao, leia o QR code e acompanhe o status sem misturar essa etapa com o restante da apresentacao do produto.
                        </p>
                      </div>
                      <div className="grid gap-3">
                        {["Ative a sessao", "Leia o QR code", "Comece a vender"].map((item, index) => (
                          <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/14 px-4 py-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-sm font-semibold text-white/84">
                              {index + 1}
                            </span>
                            <p className="text-sm text-white/72">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  {!isConnected && !isConnecting && (
                    <button
                      onClick={handleConnect}
                      className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-[var(--color-accent)] px-6 py-4 text-sm font-semibold text-[var(--color-bg)] shadow-[0_14px_36px_rgba(255,122,24,0.3)] transition hover:-translate-y-0.5"
                    >
                      Conectar WhatsApp
                    </button>
                  )}

                  {isConnecting && (
                    <button
                      onClick={handleDisconnect}
                      className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-white/14 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/6"
                    >
                      Cancelar conexao
                    </button>
                  )}

                  {isConnected && (
                    <button
                      onClick={handleDisconnect}
                      className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-rose-300/20 bg-rose-500/10 px-6 py-4 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/16"
                    >
                      Desconectar numero
                    </button>
                  )}

                  <a
                    href="#como-funciona"
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-6 py-4 text-sm font-semibold text-white/84 transition hover:border-white/18 hover:bg-white/6"
                  >
                    Entender o fluxo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>

        <section id="dor" className="mx-auto max-w-7xl px-5 py-24 md:px-8">
          <div data-reveal className="reveal max-w-3xl">
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-accent-soft)]">Onde a operacao quebra</p>
            <h2 className="mt-4 font-display text-4xl text-white md:text-5xl">Sem um fluxo claro, o WhatsApp vira gargalo comercial.</h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {painPoints.map((point, index) => (
              <article
                key={point}
                data-reveal
                className="reveal rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/16"
                style={{ transitionDelay: `${index * 90}ms` }}
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(255,122,24,0.12)] text-[var(--color-accent)]">
                  <AlertIcon className="h-5 w-5" />
                </span>
                <p className="mt-6 text-lg leading-8 text-white/78">{point}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="beneficios" className="mx-auto max-w-7xl px-5 py-24 md:px-8">
          <div data-reveal className="reveal flex max-w-3xl flex-col gap-4">
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-secondary)]">Beneficios principais</p>
            <h2 className="font-display text-4xl text-white md:text-5xl">Uma interface de venda que parece produto premium, nao painel improvisado.</h2>
            <p className="text-lg leading-8 text-[var(--color-text-muted)]">
              O redesenho combina landing page completa, narrativa comercial e a camada operacional de conexao do bot.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  data-reveal
                  className="reveal group rounded-[2rem] border border-white/10 bg-white/6 p-6 transition duration-300 hover:-translate-y-1.5 hover:border-white/18 hover:bg-white/8"
                  style={{ transitionDelay: `${index * 70}ms` }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,rgba(255,122,24,0.9),rgba(23,188,158,0.9))] text-[var(--color-bg)] shadow-[0_14px_40px_rgba(255,122,24,0.26)] transition duration-300 group-hover:scale-105">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/72">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="como-funciona" className="mx-auto max-w-7xl px-5 py-24 md:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div data-reveal className="reveal">
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-accent-soft)]">Como funciona</p>
              <h2 className="mt-4 font-display text-4xl text-white md:text-5xl">Tres passos para colocar a maquina de vendas no ar.</h2>
              <p className="mt-5 text-lg leading-8 text-[var(--color-text-muted)]">
                O fluxo foi desenhado para ser simples no mobile e convincente no desktop, com animacoes leves e sem perder legibilidade.
              </p>
            </div>

            <div className="grid gap-5">
              {steps.map((step, index) => (
                <article
                  key={step.index}
                  data-reveal
                  className="reveal grid gap-5 rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.05)] p-6 md:grid-cols-[auto_1fr] md:items-center"
                  style={{ transitionDelay: `${index * 90}ms` }}
                >
                  <div className="flex h-18 w-18 items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/8 px-5 py-4 font-display text-3xl text-white">
                    {step.index}
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-white">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/72">{step.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-7xl px-5 py-24 md:px-8">
          <div data-reveal className="reveal max-w-3xl">
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-accent-soft)]">FAQ</p>
            <h2 className="mt-4 font-display text-4xl text-white md:text-5xl">Perguntas comuns antes de colocar o numero em producao.</h2>
          </div>

          <div className="mt-10 grid gap-4">
            {faqs.map((item, index) => (
              <details
                key={item.question}
                data-reveal
                className="reveal group rounded-[1.75rem] border border-white/10 bg-white/6 p-6 transition duration-300 open:border-white/18"
                style={{ transitionDelay: `${index * 60}ms` }}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-lg font-semibold text-white marker:hidden">
                  {item.question}
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/14 text-white/70 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-4xl text-sm leading-7 text-white/70">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
          <div data-reveal className="reveal overflow-hidden rounded-[2.5rem] border border-white/12 bg-[linear-gradient(135deg,rgba(255,122,24,0.16),rgba(23,188,158,0.12),rgba(255,255,255,0.03))] p-8 md:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-accent-soft)]">CTA final</p>
                <h2 className="mt-4 font-display text-4xl text-white md:text-5xl">
                  Ligue o numero comercial e deixe o bot assumir a primeira conversa.
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/74">
                  O frontend agora vende a proposta com mais presenca visual e ainda funciona como central real de ativacao do WhatsApp.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <button
                  onClick={isConnected ? handleDisconnect : handleConnect}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 py-4 text-sm font-semibold text-[var(--color-bg)] transition hover:-translate-y-0.5"
                >
                  {isConnected ? "Desconectar sessao" : "Conectar WhatsApp"}
                </button>
                <a
                  href="#top"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/16 px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/8"
                >
                  Voltar ao topo
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-white/52 md:flex-row md:items-center md:justify-between md:px-8">
          <p>Vendedor Zap. WhatsApp commerce com IA, carrinho e PIX em uma interface mais clara.</p>
          <div className="flex flex-wrap gap-3">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="transition hover:text-white">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function BrainIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M9.5 4.5a3.5 3.5 0 0 0-3.5 3.5v.2A3.3 3.3 0 0 0 4 11.3 3.7 3.7 0 0 0 7.7 15H10v-2.2" />
      <path d="M14.5 4.5A3.5 3.5 0 0 1 18 8v.2a3.3 3.3 0 0 1 2 3.1A3.7 3.7 0 0 1 16.3 15H14v-2.2" />
      <path d="M10 8.5c0-1.4.9-2.5 2-2.5s2 1.1 2 2.5S13.1 11 12 11s-2-1.1-2-2.5Z" />
      <path d="M12 11v8" />
      <path d="M8 18c1.4-1.2 2.7-1.8 4-1.8s2.6.6 4 1.8" />
    </svg>
  );
}

function QrIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
      <path d="M14 14h2v2h-2zM18 14h2v2h-2zM16 16h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z" />
    </svg>
  );
}

function WalletIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19a1 1 0 0 1 1 1v3H6.5A2.5 2.5 0 0 0 4 11.5v-4Z" />
      <path d="M4 11.5A2.5 2.5 0 0 1 6.5 9H20v8.5a1.5 1.5 0 0 1-1.5 1.5h-12A2.5 2.5 0 0 1 4 16.5v-5Z" />
      <path d="M16.5 14h2" />
    </svg>
  );
}

function BoxIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M12 3 4 7.5 12 12l8-4.5L12 3Z" />
      <path d="M4 7.5V16.5L12 21l8-4.5V7.5" />
      <path d="M12 12v9" />
    </svg>
  );
}

function SparkIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
      <path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z" />
      <path d="m5 14 .9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9L5 14Z" />
    </svg>
  );
}

function PulseIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M3 12h4l2.2-4 3.6 8 2.4-5H21" />
    </svg>
  );
}

function CheckIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" className={className} aria-hidden="true">
      <path d="m5 12 4.2 4.2L19 6.5" />
    </svg>
  );
}

function AlertIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M12 8v5" />
      <path d="M12 17h.01" />
      <path d="M10.3 4.8 3.9 16a2 2 0 0 0 1.7 3h12.8a2 2 0 0 0 1.7-3L13.7 4.8a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}
