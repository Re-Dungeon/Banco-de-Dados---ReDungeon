#!/usr/bin/env node
// Uso:
//   node scripts/limpar-desenhos-expirados.mjs            → só mostra quantos desenhos venceram
//   node scripts/limpar-desenhos-expirados.mjs --apagar   → apaga de verdade
//   --horas=N muda a validade (padrão 2, igual aos apps)
//
// Credencial (conta de serviço do Firebase, com acesso de administrador ao projeto):
//   - FIREBASE_SERVICE_ACCOUNT com o conteúdo do JSON (usado pelo GitHub Action), ou
//   - GOOGLE_APPLICATION_CREDENTIALS com o caminho do arquivo JSON (uso local).
// Nunca commite o arquivo da conta de serviço.
/* eslint-disable no-console */
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import { DESENHO_VALIDADE_MS, limparDesenhosExpirados } from './limparDesenhos.mjs';

const args = process.argv.slice(2);
const apagar = args.includes('--apagar');
const horasArg = args.find(a => a.startsWith('--horas='));
const horas = horasArg ? Number(horasArg.split('=')[1]) : DESENHO_VALIDADE_MS / 3_600_000;
if (!Number.isFinite(horas) || horas < 1) {
  console.error('--horas precisa ser um número maior ou igual a 1');
  process.exit(1);
}

const credencial = process.env.FIREBASE_SERVICE_ACCOUNT
  ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  : applicationDefault();

initializeApp({ credential: credencial });
const db = getFirestore();

const resultado = await limparDesenhosExpirados(db, {
  validadeMs: horas * 3_600_000,
  apagar,
  log: msg => console.log(msg),
});

console.log(
  `${apagar ? 'Apagados' : 'Vencidos (simulação, use --apagar para apagar)'}: ${resultado.total} desenho(s) ` +
    `em ${resultado.cenasComDesenhos} cena(s) de ${resultado.campanhas} campanha(s); ` +
    `corte ${resultado.corte.toISOString()}.`,
);
