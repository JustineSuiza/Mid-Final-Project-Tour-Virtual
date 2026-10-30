// Browser version of the database layer. Metro picks this file instead of database.js on web,
// because expo-sqlite is not reliable in browsers. It exposes exactly the same functions and
// keeps the data in IndexedDB (large quota, so tour photos fit), private to this browser.
import { SEED_DESTINATIONS } from './seed';
import { PASS_MARK } from '../theme';

const DB_NAME = 'calabarzon_tour';
const STORE = 'kv';
const KEY = 'state';

let state = null;
let writeChain = Promise.resolve();

/* --------------------------- IndexedDB --------------------------- */

function openIdb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet() {
  const db = await openIdb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE).objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(value) {
  const db = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

// Writes are queued so two quick changes cannot overwrite each other.
function save() {
  writeChain = writeChain
    .then(() => idbSet(state))
    .catch((e) => console.warn('Could not save data in this browser:', e));
  return writeChain;
}

/* ------------------------------ setup ----------------------------- */

function buildSeed() {
  const s = {
    nextId: { destination: 1, question: 1, attempt: 1 },
    destinations: [], questions: [], progress: {}, attempts: [],
  };
  for (const d of SEED_DESTINATIONS) {
    const id = s.nextId.destination++;
    s.destinations.push({
      id, name: d.name, description: d.description, address: d.address, province: d.province,
      category: d.category, imageUri: null, latitude: d.latitude ?? null, longitude: d.longitude ?? null,
      history: d.history, significance: d.significance,
      tourUrl: null, photos: [], createdAt: new Date().toISOString(),
    });
    for (const q of d.quiz) {
      s.questions.push({
        id: s.nextId.question++, destinationId: id, question: q.question,
        options: [...q.options], answerIndex: q.answerIndex, explanation: q.explanation,
      });
    }
  }
  return s;
}

export async function initDatabase() {
  state = await idbGet();
  if (!state) {
    state = buildSeed();
    await save();
    return;
  }

  // Seed records saved before map coordinates existed get them once here.
  let changed = false;
  for (const d of SEED_DESTINATIONS) {
    if (d.latitude == null || d.longitude == null) continue;
    const saved = state.destinations.find((x) => x.name === d.name);
    if (saved && (saved.latitude == null || saved.longitude == null)) {
      saved.latitude = d.latitude;
      saved.longitude = d.longitude;
      changed = true;
    }
  }
  if (changed) await save();
}

/* ----------------------- destinations (CRUD) ---------------------- */

const listRow = (d) => {
  const p = state.progress[d.id];
  return {
    id: d.id, name: d.name, description: d.description, address: d.address, province: d.province,
    category: d.category, imageUri: d.imageUri,
    completed: p && p.completed ? 1 : 0,
    bestScore: p ? p.bestScore : null,
    totalQuestions: p ? p.totalQuestions : null,
  };
};

export async function getDestinations({ search = '', category = 'All' } = {}) {
  const needle = search.toLowerCase();
  const selectedCategories = Array.isArray(category)
    ? category
    : category === 'All' ? [] : [category];
  return state.destinations
    .filter((d) => selectedCategories.length === 0 || selectedCategories.includes(d.category))
    .filter((d) =>
      [d.name, d.description, d.address, d.province].some((f) => (f || '').toLowerCase().includes(needle))
    )
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(listRow);
}

export async function getDestination(id) {
  const d = state.destinations.find((x) => x.id === id);
  return d ? { ...d, photos: [...(d.photos || [])] } : null;
}

const clean = (d) => ({
  name: d.name, description: d.description, address: d.address, province: d.province,
  category: d.category, imageUri: d.imageUri || null, history: d.history || null,
  significance: d.significance || null, tourUrl: d.tourUrl || null, photos: [...(d.photos || [])],
});

export async function createDestination(d) {
  const id = state.nextId.destination++;
  state.destinations.push({ id, ...clean(d), createdAt: new Date().toISOString() });
  await save();
  return id;
}

export async function updateDestination(id, d) {
  const existing = state.destinations.find((x) => x.id === id);
  if (existing) Object.assign(existing, clean(d));
  await save();
}

export async function deleteDestination(id) {
  state.destinations = state.destinations.filter((d) => d.id !== id);
  state.questions = state.questions.filter((q) => q.destinationId !== id);
  state.attempts = state.attempts.filter((a) => a.destinationId !== id);
  delete state.progress[id];
  await save();
}

export async function getHomeData() {
  const counts = {};
  state.destinations.forEach((d) => (counts[d.category] = (counts[d.category] || 0) + 1));
  const categoryImages = {};
  state.destinations.forEach((d) => {
    if (d.imageUri && !categoryImages[d.category]) categoryImages[d.category] = d.imageUri;
  });
  const completed = state.destinations.filter((d) => state.progress[d.id]?.completed === 1).length;
  const upNext = state.destinations
    .filter((d) => state.progress[d.id]?.completed !== 1)
    .sort((a, b) => a.id - b.id)
    .slice(0, 4)
    .map(listRow);
  return { total: state.destinations.length, completed, counts, categoryImages, upNext };
}

/* ------------------------------ quiz ------------------------------ */

export async function getQuestions(destinationId) {
  return state.questions
    .filter((q) => q.destinationId === destinationId)
    .sort((a, b) => a.id - b.id)
    .map((q) => ({ ...q, options: [...q.options] }));
}

export async function getQuestionCount(destinationId) {
  return state.questions.filter((q) => q.destinationId === destinationId).length;
}

export async function addQuestion(destinationId, { question, options, answerIndex, explanation }) {
  state.questions.push({
    id: state.nextId.question++, destinationId, question, options: [...options],
    answerIndex, explanation: explanation || null,
  });
  await save();
}

export async function deleteQuestion(id) {
  state.questions = state.questions.filter((q) => q.id !== id);
  await save();
}

/* ---------------------------- progress ---------------------------- */

const blankProgress = (destinationId) => ({
  destinationId, completed: 0, bestScore: null, totalQuestions: null, attempts: 0, completedAt: null,
});

export async function getProgress(destinationId) {
  const p = state.progress[destinationId];
  return p ? { ...p } : null;
}

export async function setCompleted(destinationId, completed) {
  const p = state.progress[destinationId] || blankProgress(destinationId);
  p.completed = completed ? 1 : 0;
  p.completedAt = completed ? new Date().toISOString() : null;
  state.progress[destinationId] = p;
  await save();
}

export async function recordQuizAttempt(destinationId, score, total) {
  const pct = total ? score / total : 0;
  const passed = pct >= PASS_MARK;
  const prev = state.progress[destinationId] || null;

  state.attempts.push({
    id: state.nextId.attempt++, destinationId, score, total, takenAt: new Date().toISOString(),
  });

  const prevPct = prev && prev.totalQuestions ? prev.bestScore / prev.totalQuestions : -1;
  const best = prevPct >= pct ? { score: prev.bestScore, total: prev.totalQuestions } : { score, total };
  const completed = (prev && prev.completed === 1) || passed ? 1 : 0;

  state.progress[destinationId] = {
    destinationId, completed, bestScore: best.score, totalQuestions: best.total,
    attempts: ((prev && prev.attempts) || 0) + 1,
    completedAt: completed ? (prev && prev.completedAt) || new Date().toISOString() : null,
  };
  await save();
  return { pct, passed, best };
}

export async function getProgressSummary() {
  const destinations = state.destinations
    .map((d) => {
      const p = state.progress[d.id];
      return {
        id: d.id, name: d.name, category: d.category,
        completed: p && p.completed ? 1 : 0,
        bestScore: p ? p.bestScore : null,
        totalQuestions: p ? p.totalQuestions : null,
        attempts: p ? p.attempts : 0,
      };
    })
    .sort((a, b) => b.completed - a.completed || a.name.localeCompare(b.name));

  const recent = [...state.attempts]
    .sort((a, b) => b.id - a.id)
    .slice(0, 8)
    .map((a) => ({
      id: a.id, score: a.score, total: a.total, takenAt: a.takenAt,
      name: state.destinations.find((d) => d.id === a.destinationId)?.name || 'Deleted destination',
    }));

  const scored = destinations.filter((d) => d.totalQuestions);
  const avgBest = scored.length
    ? scored.reduce((sum, d) => sum + d.bestScore / d.totalQuestions, 0) / scored.length
    : null;
  return {
    total: destinations.length,
    completed: destinations.filter((d) => d.completed === 1).length,
    avgBest, destinations, recent,
  };
}
