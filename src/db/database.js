import * as SQLite from 'expo-sqlite';
import { SEED_DESTINATIONS } from './seed';
import { PASS_MARK } from '../theme';

let dbPromise = null;
function getDb() {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync('calabarzon_tour.db');
  return dbPromise;
}

// Columns used by list screens. Long text and the photo gallery are left out on purpose.
const LIST_SELECT = `d.id, d.name, d.description, d.address, d.province, d.category, d.imageUri,
  COALESCE(p.completed, 0) AS completed, p.bestScore, p.totalQuestions`;
const LIST_FROM = `FROM destinations d LEFT JOIN progress p ON p.destinationId = d.id`;

const parsePhotos = (value) => {
  try {
    return JSON.parse(value) || [];
  } catch {
    return [];
  }
};

/* ------------------------------ setup ------------------------------ */

export async function initDatabase() {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS destinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      address TEXT NOT NULL,
      province TEXT,
      category TEXT NOT NULL,
      imageUri TEXT,
      latitude REAL,
      longitude REAL,
      history TEXT,
      significance TEXT,
      tourUrl TEXT,
      photos TEXT DEFAULT '[]',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      destinationId INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      answerIndex INTEGER NOT NULL,
      explanation TEXT
    );
    CREATE TABLE IF NOT EXISTS progress (
      destinationId INTEGER PRIMARY KEY REFERENCES destinations(id) ON DELETE CASCADE,
      completed INTEGER NOT NULL DEFAULT 0,
      bestScore INTEGER,
      totalQuestions INTEGER,
      attempts INTEGER NOT NULL DEFAULT 0,
      completedAt TEXT
    );
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      destinationId INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      takenAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // user_version lets us seed once, even if the person later deletes every record.
  const v = await db.getFirstAsync('PRAGMA user_version');
  if (v.user_version === 0) {
    await seedDatabase(db);
    await db.execAsync('PRAGMA user_version = 1');
  }

  // Older installs were created before map coordinates existed.
  const columns = (await db.getAllAsync('PRAGMA table_info(destinations)')).map((c) => c.name);
  if (!columns.includes('latitude')) await db.execAsync('ALTER TABLE destinations ADD COLUMN latitude REAL');
  if (!columns.includes('longitude')) await db.execAsync('ALTER TABLE destinations ADD COLUMN longitude REAL');

  for (const d of SEED_DESTINATIONS) {
    if (d.latitude == null || d.longitude == null) continue;
    await db.runAsync(
      `UPDATE destinations SET latitude = ?, longitude = ?
        WHERE name = ? AND (latitude IS NULL OR longitude IS NULL)`,
      [d.latitude, d.longitude, d.name]
    );
  }
}

async function seedDatabase(db) {
  await db.withTransactionAsync(async () => {
    for (const d of SEED_DESTINATIONS) {
      const r = await db.runAsync(
        `INSERT INTO destinations
           (name, description, address, province, category, imageUri, latitude, longitude, history, significance, tourUrl, photos)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [d.name, d.description, d.address, d.province, d.category, null, d.latitude ?? null, d.longitude ?? null, d.history, d.significance, null, '[]']
      );
      for (const q of d.quiz) {
        await db.runAsync(
          `INSERT INTO quiz_questions (destinationId, question, options, answerIndex, explanation)
           VALUES (?, ?, ?, ?, ?)`,
          [r.lastInsertRowId, q.question, JSON.stringify(q.options), q.answerIndex, q.explanation]
        );
      }
    }
  });
}

/* ----------------------- destinations (CRUD) ----------------------- */

export async function getDestinations({ search = '', category = 'All' } = {}) {
  const db = await getDb();
  const like = `%${search}%`;
  const selectedCategories = Array.isArray(category)
    ? category
    : category === 'All' ? [] : [category];
  const categoryFilter = selectedCategories.length
    ? `AND d.category IN (${selectedCategories.map(() => '?').join(', ')})`
    : '';
  return db.getAllAsync(
    `SELECT ${LIST_SELECT} ${LIST_FROM}
     WHERE 1 = 1 ${categoryFilter}
       AND (d.name LIKE ? OR d.description LIKE ? OR d.address LIKE ? OR d.province LIKE ?)
     ORDER BY d.name COLLATE NOCASE`,
    [...selectedCategories, like, like, like, like]
  );
}

export async function getDestination(id) {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT * FROM destinations WHERE id = ?', [id]);
  return row ? { ...row, photos: parsePhotos(row.photos) } : null;
}

export async function createDestination(d) {
  const db = await getDb();
  const r = await db.runAsync(
    `INSERT INTO destinations
       (name, description, address, province, category, imageUri, latitude, longitude, history, significance, tourUrl, photos)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      d.name, d.description, d.address, d.province, d.category,
      d.imageUri || null, d.latitude ?? null, d.longitude ?? null,
      d.history || null, d.significance || null,
      d.tourUrl || null, JSON.stringify(d.photos || []),
    ]
  );
  return r.lastInsertRowId;
}

export async function updateDestination(id, d) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE destinations
        SET name = ?, description = ?, address = ?, province = ?, category = ?, imageUri = ?,
            history = ?, significance = ?, tourUrl = ?, photos = ?
      WHERE id = ?`,
    [
      d.name, d.description, d.address, d.province, d.category,
      d.imageUri || null, d.history || null, d.significance || null,
      d.tourUrl || null, JSON.stringify(d.photos || []), id,
    ]
  );
}

export async function deleteDestination(id) {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM quiz_attempts WHERE destinationId = ?', [id]);
    await db.runAsync('DELETE FROM progress WHERE destinationId = ?', [id]);
    await db.runAsync('DELETE FROM quiz_questions WHERE destinationId = ?', [id]);
    await db.runAsync('DELETE FROM destinations WHERE id = ?', [id]);
  });
}

export async function getHomeData() {
  const db = await getDb();
  const total = (await db.getFirstAsync('SELECT COUNT(*) AS n FROM destinations')).n;
  const completed = (
    await db.getFirstAsync(
      `SELECT COUNT(*) AS n FROM progress p JOIN destinations d ON d.id = p.destinationId WHERE p.completed = 1`
    )
  ).n;
  const rows = await db.getAllAsync('SELECT category, COUNT(*) AS n FROM destinations GROUP BY category');
  const counts = {};
  rows.forEach((r) => (counts[r.category] = r.n));
  const upNext = await db.getAllAsync(
    `SELECT ${LIST_SELECT} ${LIST_FROM} WHERE COALESCE(p.completed, 0) = 0 ORDER BY d.id LIMIT 4`
  );
  return { total, completed, counts, upNext };
}

/* ------------------------------ quiz ------------------------------- */

export async function getQuestions(destinationId) {
  const db = await getDb();
  const rows = await db.getAllAsync(
    'SELECT * FROM quiz_questions WHERE destinationId = ? ORDER BY id',
    [destinationId]
  );
  return rows.map((r) => ({ ...r, options: JSON.parse(r.options) }));
}

export async function getQuestionCount(destinationId) {
  const db = await getDb();
  const r = await db.getFirstAsync(
    'SELECT COUNT(*) AS n FROM quiz_questions WHERE destinationId = ?',
    [destinationId]
  );
  return r.n;
}

export async function addQuestion(destinationId, { question, options, answerIndex, explanation }) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO quiz_questions (destinationId, question, options, answerIndex, explanation)
     VALUES (?, ?, ?, ?, ?)`,
    [destinationId, question, JSON.stringify(options), answerIndex, explanation || null]
  );
}

export async function deleteQuestion(id) {
  const db = await getDb();
  await db.runAsync('DELETE FROM quiz_questions WHERE id = ?', [id]);
}

/* --------------------------- progress ------------------------------ */

export async function getProgress(destinationId) {
  const db = await getDb();
  return db.getFirstAsync('SELECT * FROM progress WHERE destinationId = ?', [destinationId]);
}

export async function setCompleted(destinationId, completed) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO progress (destinationId, completed, completedAt) VALUES (?, ?, ?)
     ON CONFLICT(destinationId) DO UPDATE SET completed = excluded.completed, completedAt = excluded.completedAt`,
    [destinationId, completed ? 1 : 0, completed ? new Date().toISOString() : null]
  );
}

// Saves the attempt, keeps the best score, and marks the destination completed on a pass.
export async function recordQuizAttempt(destinationId, score, total) {
  const db = await getDb();
  const pct = total ? score / total : 0;
  const passed = pct >= PASS_MARK;
  let best = { score, total };

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT INTO quiz_attempts (destinationId, score, total) VALUES (?, ?, ?)',
      [destinationId, score, total]
    );
    const prev = await db.getFirstAsync('SELECT * FROM progress WHERE destinationId = ?', [destinationId]);
    const prevPct = prev && prev.totalQuestions ? prev.bestScore / prev.totalQuestions : -1;
    if (prevPct >= pct) best = { score: prev.bestScore, total: prev.totalQuestions };

    const completed = (prev && prev.completed === 1) || passed ? 1 : 0;
    const completedAt = completed ? (prev && prev.completedAt) || new Date().toISOString() : null;
    await db.runAsync(
      `INSERT OR REPLACE INTO progress
         (destinationId, completed, bestScore, totalQuestions, attempts, completedAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [destinationId, completed, best.score, best.total, ((prev && prev.attempts) || 0) + 1, completedAt]
    );
  });

  return { pct, passed, best };
}

export async function getProgressSummary() {
  const db = await getDb();
  const destinations = await db.getAllAsync(
    `SELECT d.id, d.name, d.category,
            COALESCE(p.completed, 0) AS completed, p.bestScore, p.totalQuestions,
            COALESCE(p.attempts, 0) AS attempts
       FROM destinations d LEFT JOIN progress p ON p.destinationId = d.id
      ORDER BY completed DESC, d.name COLLATE NOCASE`
  );
  const recent = await db.getAllAsync(
    `SELECT a.id, a.score, a.total, a.takenAt, d.name
       FROM quiz_attempts a JOIN destinations d ON d.id = a.destinationId
      ORDER BY a.id DESC LIMIT 8`
  );
  const completed = destinations.filter((d) => d.completed === 1).length;
  const scored = destinations.filter((d) => d.totalQuestions);
  const avgBest = scored.length
    ? scored.reduce((sum, d) => sum + d.bestScore / d.totalQuestions, 0) / scored.length
    : null;
  return { total: destinations.length, completed, avgBest, destinations, recent };
}
