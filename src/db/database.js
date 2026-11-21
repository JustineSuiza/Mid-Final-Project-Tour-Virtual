import {
  collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where, writeBatch,
} from 'firebase/firestore';
import { firestore } from '../firebase';
import { LEGACY_QUIZ_QUESTIONS, SEED_DESTINATIONS } from './seed';
import { PASS_MARK } from '../theme';
import { buildDashboard } from '../utils/progressStats';

const META_DOC = doc(firestore, 'meta', 'app');
const destinationsCol = collection(firestore, 'destinations');
const questionsCol = collection(firestore, 'quiz_questions');
const progressCol = collection(firestore, 'progress');
const attemptsCol = collection(firestore, 'quiz_attempts');

const num = (v) => (v === undefined || v === null || v === '' ? null : Number(v));
const str = (v, fallback = '') => (v === undefined || v === null ? fallback : String(v));
const asId = (id) => String(id);

const parseOptions = (value) => {
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value) || []; } catch { return []; }
};
const parsePhotos = (value) => {
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value) || []; } catch { return []; }
};

const destDoc = (id) => doc(firestore, 'destinations', asId(id));
const questionDoc = (id) => doc(firestore, 'quiz_questions', asId(id));
const progressDoc = (id) => doc(firestore, 'progress', asId(id));
const attemptDoc = (id) => doc(firestore, 'quiz_attempts', asId(id));

function cleanDestination(d, id) {
  return {
    id: asId(id),
    name: str(d.name).trim(),
    description: str(d.description).trim(),
    address: str(d.address).trim(),
    province: str(d.province).trim(),
    category: str(d.category).trim(),
    imageUri: d.imageUri || null,
    latitude: num(d.latitude),
    longitude: num(d.longitude),
    history: d.history || null,
    significance: d.significance || null,
    tourUrl: d.tourUrl || null,
    photos: parsePhotos(d.photos),
    createdAt: d.createdAt || new Date().toISOString(),
  };
}

function cleanQuestion(q, id) {
  return {
    id: asId(id),
    destinationId: asId(q.destinationId),
    question: str(q.question),
    options: parseOptions(q.options),
    answerIndex: Number(q.answerIndex),
    explanation: q.explanation || null,
    createdAt: q.createdAt || null,
  };
}

function cleanProgress(p, id) {
  return {
    destinationId: asId(id ?? p.destinationId),
    completed: p.completed ? 1 : 0,
    bestScore: p.bestScore ?? null,
    totalQuestions: p.totalQuestions ?? null,
    attempts: Number(p.attempts || 0),
    completedAt: p.completedAt || null,
  };
}

function cleanAttempt(a, id) {
  return {
    id: asId(id),
    destinationId: asId(a.destinationId),
    score: Number(a.score || 0),
    total: Number(a.total || 0),
    takenAt: a.takenAt || new Date().toISOString(),
  };
}

async function getMeta() {
  const snap = await getDoc(META_DOC);
  return snap.exists() ? snap.data() : {};
}

async function nextId(field) {
  const meta = await getMeta();
  const counters = { ...(meta.counters || {}) };
  const n = Number(counters[field] || 1);
  counters[field] = n + 1;
  await setDoc(META_DOC, { ...meta, counters }, { merge: true });
  return String(n);
}

async function getAllDestinations() {
  const snap = await getDocs(destinationsCol);
  return snap.docs.map((d) => cleanDestination(d.data(), d.id));
}
async function getAllQuestions() {
  const snap = await getDocs(questionsCol);
  return snap.docs.map((d) => cleanQuestion(d.data(), d.id));
}
async function getAllProgress() {
  const snap = await getDocs(progressCol);
  return snap.docs.map((d) => cleanProgress(d.data(), d.id));
}
async function getAllAttempts() {
  const snap = await getDocs(attemptsCol);
  return snap.docs.map((d) => cleanAttempt(d.data(), d.id));
}

const listRow = (d, p) => ({
  id: d.id, name: d.name, description: d.description, address: d.address, province: d.province,
  category: d.category, imageUri: d.imageUri, latitude: d.latitude ?? null, longitude: d.longitude ?? null,
  completed: p?.completed ? 1 : 0, bestScore: p?.bestScore ?? null, totalQuestions: p?.totalQuestions ?? null,
});

function sameQuiz(existing, seedQuiz) {
  if (existing.length !== seedQuiz.length) return false;
  return existing.every((q, i) => {
    const seed = seedQuiz[i];
    return q.question === seed.question
      && q.answerIndex === seed.answerIndex
      && JSON.stringify(q.options) === JSON.stringify(seed.options);
  });
}

/* ------------------------------ setup ------------------------------ */

export async function initDatabase() {
  const meta = await getMeta();
  if (meta.seeded) {
    await syncSeedMaintenance();
    return;
  }
  const existing = await getDocs(destinationsCol);
  if (!existing.empty) {
    await setDoc(META_DOC, { seeded: true }, { merge: true });
    await syncSeedMaintenance();
    return;
  }
  await seedDatabase();
  await setDoc(META_DOC, { seeded: true, counters: await computeCounters() }, { merge: true });
}

async function computeCounters() {
  const [dests, questions, attempts] = await Promise.all([getAllDestinations(), getAllQuestions(), getAllAttempts()]);
  const maxNum = (arr) => arr.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0);
  return { destination: maxNum(dests) + 1, question: maxNum(questions) + 1, attempt: maxNum(attempts) + 1 };
}

async function seedDatabase() {
  let destination = 1, question = 1;
  for (const d of SEED_DESTINATIONS) {
    const id = String(destination++);
    await setDoc(destDoc(id), cleanDestination({ ...d, photos: [] }, id));
    for (const q of d.quiz) {
      const qid = String(question++);
      await setDoc(questionDoc(qid), cleanQuestion({ ...q, destinationId: id, createdAt: new Date().toISOString() }, qid));
    }
  }
  await setDoc(META_DOC, { counters: { destination, question, attempt: 1 } }, { merge: true });
}

async function syncSeedMaintenance() {
  const [dests, questions] = await Promise.all([getAllDestinations(), getAllQuestions()]);
  const byName = new Map(dests.map((d) => [d.name, d]));

  for (const seed of SEED_DESTINATIONS) {
    const dest = byName.get(seed.name);
    if (!dest) continue;
    const patch = {};
    if (seed.latitude != null && dest.latitude == null) patch.latitude = seed.latitude;
    if (seed.longitude != null && dest.longitude == null) patch.longitude = seed.longitude;
    if (seed.imageUri && !dest.imageUri) patch.imageUri = seed.imageUri;
    if (Object.keys(patch).length) await updateDoc(destDoc(dest.id), patch);
  }

  for (const seed of SEED_DESTINATIONS) {
    const legacySets = LEGACY_QUIZ_QUESTIONS[seed.name];
    if (!legacySets) continue;
    const dest = byName.get(seed.name);
    if (!dest) continue;
    const existing = questions.filter((q) => q.destinationId === dest.id).sort((a, b) => Number(a.id) - Number(b.id));
    if (sameQuiz(existing, seed.quiz)) continue;
    const legacyMatch = legacySets.some((legacy) =>
      existing.length === legacy.length && existing.every((q, i) => q.question === legacy[i])
    );
    if (!legacyMatch) continue;

    const batch = writeBatch(firestore);
    existing.forEach((q) => batch.delete(questionDoc(q.id)));
    const [attempts, progress] = await Promise.all([getAllAttempts(), getAllProgress()]);
    attempts.filter((a) => a.destinationId === dest.id).forEach((a) => batch.delete(attemptDoc(a.id)));
    if (progress.find((p) => p.destinationId === dest.id)) batch.delete(progressDoc(dest.id));
    let qidCounter = Number((await getMeta()).counters?.question || 1);
    for (const q of seed.quiz) {
      const qid = String(qidCounter++);
      batch.set(questionDoc(qid), cleanQuestion({ ...q, destinationId: dest.id, createdAt: new Date().toISOString() }, qid));
    }
    await batch.commit();
    await setDoc(META_DOC, { counters: { ...(await getMeta()).counters, question: qidCounter } }, { merge: true });
  }
}

/* ----------------------- destinations (CRUD) ----------------------- */

export async function getDestinations({ search = '', category = 'All' } = {}) {
  const needle = search.toLowerCase();
  const selectedCategories = Array.isArray(category) ? category : category === 'All' ? [] : [category];
  const [dests, progress] = await Promise.all([getAllDestinations(), getAllProgress()]);
  const pmap = new Map(progress.map((p) => [p.destinationId, p]));
  return dests
    .filter((d) => selectedCategories.length === 0 || selectedCategories.includes(d.category))
    .filter((d) => [d.name, d.description, d.address, d.province].some((f) => (f || '').toLowerCase().includes(needle)))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((d) => listRow(d, pmap.get(d.id)));
}

export async function getDestination(id) {
  const snap = await getDoc(destDoc(id));
  return snap.exists() ? cleanDestination(snap.data(), snap.id) : null;
}

export async function createDestination(d) {
  const id = await nextId('destination');
  await setDoc(destDoc(id), cleanDestination({ ...d, createdAt: new Date().toISOString() }, id));
  return id;
}

export async function updateDestination(id, d) {
  const ref = destDoc(id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const existing = cleanDestination(snap.data(), snap.id);
  const next = cleanDestination({ ...existing, ...d, id: asId(id), createdAt: existing.createdAt }, id);
  await setDoc(ref, next);
}

export async function deleteDestination(id) {
  const did = asId(id);
  const [questions, attempts, progress] = await Promise.all([getAllQuestions(), getAllAttempts(), getAllProgress()]);
  const batch = writeBatch(firestore);
  questions.filter((q) => q.destinationId === did).forEach((q) => batch.delete(questionDoc(q.id)));
  attempts.filter((a) => a.destinationId === did).forEach((a) => batch.delete(attemptDoc(a.id)));
  if (progress.find((p) => p.destinationId === did)) batch.delete(progressDoc(did));
  batch.delete(destDoc(did));
  await batch.commit();
}

export async function getHomeData() {
  const [dests, progress] = await Promise.all([getAllDestinations(), getAllProgress()]);
  const pmap = new Map(progress.map((p) => [p.destinationId, p]));
  const counts = {};
  dests.forEach((d) => (counts[d.category] = (counts[d.category] || 0) + 1));
  const categoryImages = {};
  dests.forEach((d) => { if (d.imageUri && !categoryImages[d.category]) categoryImages[d.category] = d.imageUri; });
  const completed = dests.filter((d) => pmap.get(d.id)?.completed === 1).length;
  const upNext = dests
    .filter((d) => pmap.get(d.id)?.completed !== 1)
    .sort((a, b) => Number(a.id) - Number(b.id))
    .slice(0, 4)
    .map((d) => listRow(d, pmap.get(d.id)));
  return { total: dests.length, completed, counts, categoryImages, upNext };
}

/* ------------------------------ quiz ------------------------------- */

export async function getQuestions(destinationId) {
  const did = asId(destinationId);
  const snap = await getDocs(query(questionsCol, where('destinationId', '==', did)));
  return snap.docs.map((d) => cleanQuestion(d.data(), d.id)).sort((a, b) => Number(a.id) - Number(b.id));
}

export async function getQuestionCount(destinationId) {
  const did = asId(destinationId);
  const snap = await getDocs(query(questionsCol, where('destinationId', '==', did)));
  return snap.size;
}

export async function addQuestion(destinationId, { question, options, answerIndex, explanation }) {
  const id = await nextId('question');
  await setDoc(questionDoc(id), cleanQuestion({
    destinationId: asId(destinationId), question, options: [...options],
    answerIndex, explanation: explanation || null, createdAt: new Date().toISOString(),
  }, id));
}

export async function deleteQuestion(id) {
  await deleteDoc(questionDoc(id));
}

/* --------------------------- progress ------------------------------ */

export async function getProgress(destinationId) {
  const snap = await getDoc(progressDoc(destinationId));
  return snap.exists() ? cleanProgress(snap.data(), snap.id) : null;
}

export async function setCompleted(destinationId, completed) {
  const did = asId(destinationId);
  const prev = await getProgress(did);
  const next = cleanProgress({
    destinationId: did,
    completed: completed ? 1 : 0,
    bestScore: prev?.bestScore ?? null,
    totalQuestions: prev?.totalQuestions ?? null,
    attempts: prev?.attempts || 0,
    completedAt: completed ? new Date().toISOString() : null,
  }, did);
  await setDoc(progressDoc(did), next);
}

export async function recordQuizAttempt(destinationId, score, total) {
  const did = asId(destinationId);
  const pct = total ? score / total : 0;
  const passed = pct >= PASS_MARK;
  const prev = await getProgress(did);
  const prevPct = prev && prev.totalQuestions ? prev.bestScore / prev.totalQuestions : -1;
  const best = prevPct >= pct ? { score: prev.bestScore, total: prev.totalQuestions } : { score, total };
  const completed = (prev && prev.completed === 1) || passed ? 1 : 0;

  const attemptId = await nextId('attempt');
  await setDoc(attemptDoc(attemptId), cleanAttempt({
    destinationId: did, score, total, takenAt: new Date().toISOString(),
  }, attemptId));
  await setDoc(progressDoc(did), cleanProgress({
    destinationId: did, completed, bestScore: best.score, totalQuestions: best.total,
    attempts: ((prev && prev.attempts) || 0) + 1,
    completedAt: completed ? (prev && prev.completedAt) || new Date().toISOString() : null,
  }, did));
  return { pct, passed, best };
}

export async function getProgressSummary() {
  const [dests, progress, attempts] = await Promise.all([getAllDestinations(), getAllProgress(), getAllAttempts()]);
  const pmap = new Map(progress.map((p) => [p.destinationId, p]));
  const destinations = dests.map((d) => {
    const p = pmap.get(d.id);
    return {
      id: d.id, name: d.name, category: d.category,
      completed: p?.completed ? 1 : 0, bestScore: p?.bestScore ?? null,
      totalQuestions: p?.totalQuestions ?? null, attempts: p?.attempts || 0,
    };
  }).sort((a, b) => b.completed - a.completed || a.name.localeCompare(b.name));

  const recent = [...attempts].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 8).map((a) => ({
    id: a.id, score: a.score, total: a.total, takenAt: a.takenAt,
    name: dests.find((d) => d.id === a.destinationId)?.name || 'Deleted destination',
  }));
  const scored = destinations.filter((d) => d.totalQuestions);
  const avgBest = scored.length ? scored.reduce((sum, d) => sum + d.bestScore / d.totalQuestions, 0) / scored.length : null;
  return { total: destinations.length, completed: destinations.filter((d) => d.completed === 1).length, avgBest, destinations, recent };
}

export async function getProgressDashboard() {
  const [dests, attempts] = await Promise.all([getAllDestinations(), getAllAttempts()]);
  const destinations = dests.map((d) => ({ id: d.id, name: d.name, category: d.category })).sort((a, b) => Number(a.id) - Number(b.id));
  const categories = new Map(destinations.map((d) => [d.id, d.category]));
  const attemptRows = attempts
    .filter((a) => categories.has(a.destinationId))
    .sort((a, b) => Number(a.id) - Number(b.id))
    .map((a) => ({ destinationId: a.destinationId, score: a.score, total: a.total, category: categories.get(a.destinationId) }));
  return buildDashboard(destinations, attemptRows);
}

export async function resetProgress() {
  const [attempts, progress] = await Promise.all([getAllAttempts(), getAllProgress()]);
  const batch = writeBatch(firestore);
  attempts.forEach((a) => batch.delete(attemptDoc(a.id)));
  progress.forEach((p) => batch.delete(progressDoc(p.destinationId)));
  await batch.commit();
}
