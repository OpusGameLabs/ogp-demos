import Database, { type Database as DatabaseType } from "better-sqlite3";
import * as path from "path";
import * as fs from "fs";

const DB_PATH =
  process.env.DATABASE_PATH || path.join(__dirname, "../data/games.db");

// Initialize database
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}
export const db: DatabaseType = new Database(DB_PATH);

db.pragma("journal_mode = WAL");

// Create tables
export function initDatabase() {
  // ensure the db path directory exists
  // Users table - stores user info and their OGP user ID
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      ogp_user_id TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Games table - stores all games created by users
  db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id TEXT UNIQUE NOT NULL,
      user_email TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      game_url TEXT NOT NULL,
      platform TEXT,
      points_per_jump INTEGER,
      lives INTEGER,
      block_image_url TEXT,
      image_url TEXT,
      cover_image_url TEXT,
      twitter TEXT,
      discord TEXT,
      telegram TEXT,
      max_score_per_session INTEGER,
      max_sessions_per_day INTEGER,
      max_cumulative_points_per_day INTEGER,
      org_rewards_split TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_email) REFERENCES users(email)
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_games_user_email ON games(user_email);
    CREATE INDEX IF NOT EXISTS idx_games_game_id ON games(game_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_ogp_user_id ON users(ogp_user_id);
  `);

  console.log("✅ Database initialized successfully");
}

// User operations
export interface User {
  id?: number;
  email: string;
  ogp_user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const userDb = {
  // Get or create a user by email
  getOrCreate: (email: string): User => {
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    let user = stmt.get(email) as User | undefined;

    if (!user) {
      const insertStmt = db.prepare("INSERT INTO users (email) VALUES (?)");
      const result = insertStmt.run(email);
      user = {
        id: Number(result.lastInsertRowid),
        email,
      };
    }

    return user;
  },

  // Update user's OGP user ID
  updateOgpUserId: (email: string, ogpUserId: string): void => {
    const stmt = db.prepare(
      "UPDATE users SET ogp_user_id = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?"
    );
    stmt.run(ogpUserId, email);
  },

  // Get user by email
  getByEmail: (email: string): User | undefined => {
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    return stmt.get(email) as User | undefined;
  },

  // Get user by OGP user ID
  getByOgpUserId: (ogpUserId: string): User | undefined => {
    const stmt = db.prepare("SELECT * FROM users WHERE ogp_user_id = ?");
    return stmt.get(ogpUserId) as User | undefined;
  },
};

// Game operations
export interface Game {
  id?: number;
  game_id: string;
  user_email: string;
  name: string;
  description?: string;
  game_url: string;
  platform?: string;
  points_per_jump?: number;
  lives?: number;
  block_image_url?: string;
  image_url?: string;
  cover_image_url?: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
  max_score_per_session?: number;
  max_sessions_per_day?: number;
  max_cumulative_points_per_day?: number;
  org_rewards_split?: string;
  created_at?: string;
  updated_at?: string;
}

export const gameDb = {
  // Create a new game
  create: (
    game: Omit<Game, "id" | "created_at" | "updated_at">
  ): Game | null => {
    const stmt = db.prepare(`
      INSERT INTO games (
        game_id, user_email, name, description, game_url, platform,
        points_per_jump, lives, block_image_url, image_url, cover_image_url,
        twitter, discord, telegram, max_score_per_session, max_sessions_per_day,
        max_cumulative_points_per_day, org_rewards_split
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      game.game_id,
      game.user_email,
      game.name,
      game.description,
      game.game_url,
      game.platform,
      game.points_per_jump,
      game.lives,
      game.block_image_url,
      game.image_url,
      game.cover_image_url,
      game.twitter,
      game.discord,
      game.telegram,
      game.max_score_per_session,
      game.max_sessions_per_day,
      game.max_cumulative_points_per_day,
      game.org_rewards_split
    );

    return {
      ...game,
      id: Number(result.lastInsertRowid),
    };
  },

  // Get game by OGP game ID
  getByGameId: (gameId: string): Game | undefined => {
    const stmt = db.prepare("SELECT * FROM games WHERE game_id = ?");
    return stmt.get(gameId) as Game | undefined;
  },

  // Get all games for a user by email
  getByUserEmail: (email: string): Game[] => {
    const stmt = db.prepare(
      "SELECT * FROM games WHERE user_email = ? ORDER BY created_at DESC"
    );
    return stmt.all(email) as Game[];
  },

  // Get all games
  getAll: (limit = 20, offset = 0): Game[] => {
    const stmt = db.prepare(
      "SELECT * FROM games ORDER BY created_at DESC LIMIT ? OFFSET ?"
    );
    return stmt.all(limit, offset) as Game[];
  },

  // Update game
  update: (gameId: string, updates: Partial<Game>): void => {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== "id" && key !== "game_id" && key !== "created_at") {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return;

    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(gameId);

    const stmt = db.prepare(
      `UPDATE games SET ${fields.join(", ")} WHERE game_id = ?`
    );
    stmt.run(...values);
  },

  // Delete game
  delete: (gameId: string): void => {
    const stmt = db.prepare("DELETE FROM games WHERE game_id = ?");
    stmt.run(gameId);
  },

  // Get total count of games
  count: (): number => {
    const stmt = db.prepare("SELECT COUNT(*) as count FROM games");
    const result = stmt.get() as { count: number };
    return result.count;
  },

  // Get count of games for a user
  countByUser: (email: string): number => {
    const stmt = db.prepare(
      "SELECT COUNT(*) as count FROM games WHERE user_email = ?"
    );
    const result = stmt.get(email) as { count: number };
    return result.count;
  },
};

// Helper to extract OGP user ID from orgRewardsSplit
export function extractOgpUserIdFromRewardsSplit(
  orgRewardsSplit: Record<string, number>,
  platformUserId: string
): string | null {
  for (const key in orgRewardsSplit) {
    if (key !== platformUserId) {
      return key; // This is the OGP user ID
    }
  }

  return null;
}

// Close database connection gracefully
export function closeDatabase() {
  db.close();
}

// Initialize database on module load
initDatabase();
