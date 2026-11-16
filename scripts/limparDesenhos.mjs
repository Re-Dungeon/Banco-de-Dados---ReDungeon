// Apaga os desenhos do grid que já venceram (rmCampanhas/{id}/gridCenas/{cenaId}/desenhos).
// Os apps só mostram desenhos com createdAt nas últimas 2 h (DESENHO_VALIDADE_MS em
// common/utils/gridDesenho.js da Ficha/Re:Master); este script remove os mais antigos,
// já que a política de TTL do Firestore não está disponível no plano gratuito.
//
// Percorre campanha → cena → desenhos com uma consulta simples por createdAt (índice de
// campo único automático; não precisa de índice de grupo de coleções). Recebe o `db` do
// firebase-admin por parâmetro para poder ser testado sem Firebase.

export const DESENHO_VALIDADE_MS = 2 * 60 * 60 * 1000;
const TAMANHO_PAGINA = 400;

const apagarEmLote = async (db, docs) => {
  const lote = db.batch();
  docs.forEach(d => lote.delete(d.ref));
  await lote.commit();
};

const limparCena = async (db, cenaRef, corte, apagar) => {
  let total = 0;
  let ultimo = null;
  for (;;) {
    let consulta = cenaRef
      .collection('desenhos')
      .where('createdAt', '<', corte)
      .orderBy('createdAt')
      .limit(TAMANHO_PAGINA);
    if (ultimo) consulta = consulta.startAfter(ultimo);
    const snapshot = await consulta.get();
    if (snapshot.empty) break;
    if (apagar) await apagarEmLote(db, snapshot.docs);
    total += snapshot.size;
    if (snapshot.size < TAMANHO_PAGINA) break;
    ultimo = snapshot.docs[snapshot.docs.length - 1];
  }
  return total;
};

export const limparDesenhosExpirados = async (
  db,
  { agora = Date.now(), validadeMs = DESENHO_VALIDADE_MS, apagar = false, log = () => {} } = {},
) => {
  const corte = new Date(agora - validadeMs);
  const campanhas = await db.collection('rmCampanhas').listDocuments();
  let total = 0;
  let cenasComDesenhos = 0;
  for (const campanhaRef of campanhas) {
    const cenas = await campanhaRef.collection('gridCenas').listDocuments();
    for (const cenaRef of cenas) {
      const n = await limparCena(db, cenaRef, corte, apagar);
      if (n > 0) {
        cenasComDesenhos += 1;
        log(`${campanhaRef.id}/${cenaRef.id}: ${n} desenho(s) ${apagar ? 'apagado(s)' : 'vencido(s)'}`);
      }
      total += n;
    }
  }
  return { total, cenasComDesenhos, campanhas: campanhas.length, corte };
};
