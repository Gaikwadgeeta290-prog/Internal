import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: "backend/.env" });

const env = (name, fallback = "") =>
  process.env[name] !== undefined ? process.env[name] : fallback;

export const DB_CONFIG = {
  host: env("DB_HOST", "localhost"),
  user: env("DB_USER", "root"),
  password: env("DB_PASSWORD", ""),
  port: Number(env("DB_PORT", "3306")),
  database: env("DB_NAME", "atelier_noire"),
  waitForConnections: true,
  connectionLimit: Number(env("DB_CONNECTION_LIMIT", "10")),
  queueLimit: 0,
  charset: "utf8mb4",
  multipleStatements: true,
};

export const pool = mysql.createPool(DB_CONFIG);

export async function ensureDatabase() {
  const server = await mysql.createConnection({
    host: DB_CONFIG.host,
    user: DB_CONFIG.user,
    password: DB_CONFIG.password,
    port: DB_CONFIG.port,
    multipleStatements: false,
  });

  const dbName = DB_CONFIG.database.replace(/`/g, "");
  await server.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await server.end();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      title VARCHAR(180) NOT NULL,
      category VARCHAR(80) NOT NULL,
      style VARCHAR(120) DEFAULT NULL,
      location VARCHAR(120) NOT NULL,
      year VARCHAR(10) NOT NULL,
      image_url TEXT,
      secondary_url TEXT,
      story TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_projects_category(category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS project_images (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      project_id INT UNSIGNED NOT NULL,
      image_url TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_project_images_project(project_id),
      CONSTRAINT fk_project_images_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS enquiries (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(160) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(60) NOT NULL,
      city VARCHAR(120) DEFAULT NULL,
      project_type VARCHAR(120) DEFAULT NULL,
      property_type VARCHAR(120) DEFAULT NULL,
      area VARCHAR(100) DEFAULT NULL,
      budget VARCHAR(100) DEFAULT NULL,
      start_date DATE DEFAULT NULL,
      message TEXT NOT NULL,
      email_sent TINYINT(1) NOT NULL DEFAULT 0,
      admin_notified TINYINT(1) NOT NULL DEFAULT 0,
      status ENUM('new','contacted','closed') NOT NULL DEFAULT 'new',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(id),
      INDEX idx_enquiries_email(email),
      INDEX idx_enquiries_created(created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS consultations (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(160) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(60) NOT NULL,
      preferred_date DATE NOT NULL,
      preferred_time VARCHAR(60) NOT NULL,
      message VARCHAR(255) DEFAULT NULL,
      email_sent TINYINT(1) NOT NULL DEFAULT 0,
      admin_notified TINYINT(1) NOT NULL DEFAULT 0,
      status ENUM('new','confirmed','completed','cancelled') NOT NULL DEFAULT 'new',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(id),
      INDEX idx_consultations_email(email),
      INDEX idx_consultations_date(preferred_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS admin_users (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(160) NOT NULL DEFAULT 'Atelier Noire Admin',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS admin_sessions (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      token_hash CHAR(64) NOT NULL UNIQUE,
      admin_id INT UNSIGNED NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(id),
      INDEX idx_admin_sessions_expiry(expires_at),
      CONSTRAINT fk_admin_sessions_admin
        FOREIGN KEY (admin_id) REFERENCES admin_users(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS audit_logs (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      admin_id INT UNSIGNED DEFAULT NULL,
      action VARCHAR(120) NOT NULL,
      entity VARCHAR(120) DEFAULT NULL,
      entity_id VARCHAR(80) DEFAULT NULL,
      details TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(id),
      INDEX idx_audit_created(created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    event_type VARCHAR(60) NOT NULL,
    page_path VARCHAR(500) DEFAULT NULL,
    metadata JSON DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_analytics_type_created(event_type, created_at),
    INDEX idx_analytics_created(created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

}

export default pool;
