import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  proto,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import path from 'path';

const AUTH_FOLDER = path.join(process.cwd(), 'whatsapp_auth');

type ConnectionStatus = 'disconnected' | 'connecting' | 'qr' | 'connected';

interface WAState {
  sock: WASocket | null;
  status: ConnectionStatus;
  qr: string | null;
  connecting: boolean;
  listeners: Set<(qr: string | null, status: ConnectionStatus) => void>;
}

const state: WAState = {
  sock: null,
  status: 'disconnected',
  qr: null,
  connecting: false,
  listeners: new Set(),
};

export function subscribeToStatus(
  cb: (qr: string | null, status: ConnectionStatus) => void
): () => void {
  state.listeners.add(cb);
  // defer so caller can store the returned unsubscribe fn before first emit
  queueMicrotask(() => cb(state.qr, state.status));
  return () => state.listeners.delete(cb);
}

function emit(qr: string | null, status: ConnectionStatus) {
  state.qr = qr;
  state.status = status;
  state.listeners.forEach(cb => cb(qr, status));
}

export async function connectWhatsApp() {
  // prevent multiple simultaneous connection attempts
  if (state.connecting || state.status === 'connected') return;
  state.connecting = true;

  try {
    emit(null, 'connecting');

    const { state: authState, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      auth: authState,
      printQRInTerminal: false,
      version,
      browser: ['VendedorZap', 'Chrome', '120.0.0'],
    });
    state.sock = sock;

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
      if (qr) emit(qr, 'qr');

      if (connection === 'open') {
        state.connecting = false;
        emit(null, 'connected');
      }

      if (connection === 'close') {
        state.sock = null;
        state.connecting = false;
        const code = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = code !== DisconnectReason.loggedOut;
        emit(null, 'disconnected');
        if (shouldReconnect) {
          // delay before reconnect to avoid tight loop
          setTimeout(() => connectWhatsApp(), 3000);
        }
      }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;
      const { handleMessage } = await import('../services/messageHandler');
      for (const msg of messages) {
        if (!msg.key.fromMe) await handleMessage(sock, msg);
      }
    });
  } catch (err) {
    state.connecting = false;
    emit(null, 'disconnected');
    throw err;
  }
}

export async function disconnectWhatsApp() {
  state.connecting = false;
  if (state.sock) {
    await state.sock.logout().catch(() => {});
    state.sock = null;
  }
  emit(null, 'disconnected');
}

export async function sendMessage(to: string, text: string) {
  if (!state.sock) throw new Error('WhatsApp not connected');
  const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
  await state.sock.sendMessage(jid, { text });
}

export function getStatus(): ConnectionStatus {
  return state.status;
}

export function getMessageText(msg: proto.IWebMessageInfo): string {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    ''
  );
}

export function getSenderJid(msg: proto.IWebMessageInfo): string {
  return msg.key?.remoteJid || '';
}
