import dotenv from "dotenv";
dotenv.config({ path: "backend/.env" });

import mysql from "mysql2/promise";

const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || "atelier_noire",
};

try {
  const connection = await mysql.createConnection(config);
  const [rows] = await connection.query("SELECT DATABASE() AS database_name, NOW() AS server_time");
  console.log("DATABASE CONNECTION: OK");
  console.log(rows[0]);
  await connection.end();
  process.exit(0);
} catch (error) {
  console.error("DATABASE CONNECTION: FAILED");
  console.error(error.message);
  process.exit(1);
}
