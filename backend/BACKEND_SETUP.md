# Atelier Noire — Backend + MySQL

The frontend source under `src/` and `public/` is unchanged. The backend implementation is intentionally flat: every backend file is directly inside the single `backend/` folder. There are no controller/model/config/backend subfolders.

## Backend folder

```text
backend/
  app.js
  auth.js
  db.js
  schema.sql
  test-db.js
  .env.example
```

`api/` is only the Vercel adapter needed to expose the same backend through `/api/*`. It contains no backend business logic.

## 1. Requirements

- Node.js 20+ (Node 22+ recommended)
- MySQL Server 8+
- MySQL Workbench

## 2. Install

Open PowerShell in the project root:

```powershell
npm install
```

## 3. Create the backend environment file

Copy:

```text
backend\.env.example
```

to:

```text
backend\.env
```

Set your real MySQL root password:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_REAL_MYSQL_PASSWORD
DB_NAME=atelier_noire
DB_PORT=3306
```

For first local setup the admin credentials are:

```text
Email:    admin@gmail.com
Password: admin123
```

Do not put real secrets into GitHub. `backend/.env` is ignored by `.gitignore`.

## 4. Start the backend

Terminal 1:

```powershell
npm run backend
```

Expected:

```text
Atelier Noire backend: http://localhost:5050
Health check: http://localhost:5050/api/health
Created admin account: admin@gmail.com
Seeded 20 projects.
```

The database `atelier_noire` and all tables are created automatically.

## 5. Start the frontend

Terminal 2:

```powershell
npm run dev
```

Open:

```text
http://localhost:5173
```

Vite already proxies `/api` to `http://localhost:5050`, so the frontend does not need to be changed.

## 6. Admin login

Open:

```text
http://localhost:5173/admin/login
```

Use:

```text
Email:    admin@gmail.com
Password: admin123
```

After login:

```text
http://localhost:5173/admin/dashboard
```

The password is hashed before it is stored in MySQL. Login sessions are stored in `admin_sessions` and expire after 8 hours.

## 7. Check backend

Open:

```text
http://localhost:5050/api/health
```

Successful result:

```json
{
  "ok": true,
  "service": "atelier-noire-api",
  "database": "connected",
  "smtp": false
}
```

`"smtp": false` is normal until email credentials are configured.

## 8. Check database

Run:

```powershell
npm run db:test
```

Expected:

```text
DATABASE CONNECTION: OK
```

Or in MySQL Workbench:

```sql
USE atelier_noire;

SHOW TABLES;

SELECT * FROM admin_users;
SELECT COUNT(*) AS project_count FROM projects;
SELECT * FROM enquiries ORDER BY created_at DESC;
SELECT * FROM consultations ORDER BY created_at DESC;
SELECT * FROM admin_sessions ORDER BY created_at DESC;
SELECT * FROM audit_logs ORDER BY created_at DESC;
```

## 9. Test a real enquiry

Use the existing Begin Project page:

```text
http://localhost:5173/begin-project
```

Submit the form.

Then check:

```sql
SELECT id,name,email,status,email_sent,admin_notified,created_at
FROM enquiries
ORDER BY id DESC;
```

The record should appear.

## 10. Test a consultation

Open:

```text
http://localhost:5173/contact
```

Submit a consultation.

Then:

```sql
SELECT id,name,email,preferred_date,preferred_time,status,email_sent,admin_notified
FROM consultations
ORDER BY id DESC;
```

## 11. Email replies

The forms save to MySQL even if SMTP is not configured.

To send an automatic reply to the visitor and a notification to the studio inbox, configure:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=yourstudio@gmail.com
SMTP_PASSWORD=YOUR_GMAIL_APP_PASSWORD
SMTP_FROM_NAME=Atelier Noire
ADMIN_NOTIFICATION_EMAIL=yourstudio@gmail.com
```

For Gmail, use a Google App Password. Do not use your normal Gmail password.

Restart the backend after changing `.env`.

## 12. Backend API

Public:

```text
GET  /api/health
GET  /api/projects
GET  /api/projects/:id
POST /api/contact
POST /api/consultations
```

Admin:

```text
POST   /api/admin/login
POST   /api/admin/logout
GET    /api/admin/me
GET    /api/admin/stats

GET    /api/admin/projects
POST   /api/admin/projects
PUT    /api/admin/projects/:id
DELETE /api/admin/projects/:id

POST   /api/admin/projects/:id/images
DELETE /api/admin/project-images/:id

GET    /api/admin/enquiries
PATCH  /api/admin/enquiries/:id
DELETE /api/admin/enquiries/:id

GET    /api/admin/consultations
PATCH  /api/admin/consultations/:id
```

Admin endpoints require:

```text
Authorization: Bearer <login-token>
```

## 13. Important

The existing frontend has deliberately not been redesigned or rewritten for this backend. The existing `/api` frontend calls continue to work through the Vite proxy locally and the Vercel adapter in deployment.


## SMTP and email verification

The current built-in SMTP sender uses implicit TLS on port `465`. Configure `SMTP_HOST`, `SMTP_PORT=465`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_NAME`, and `ADMIN_NOTIFICATION_EMAIL` in `backend/.env`. Do not share or commit `.env`. The health endpoint's `smtp: true` means only that host, username, and password variables exist; it does not test credentials or message delivery.

After logging in as admin, send a protected SMTP test with the admin bearer token:

```powershell
$headers = @{ Authorization = "Bearer YOUR_ADMIN_SESSION_TOKEN" }
Invoke-RestMethod -Method Post -Uri http://localhost:5050/api/admin/email-test -Headers $headers
```

The response `accepted_by_smtp` means the SMTP server accepted the message, not necessarily that it reached the final inbox. Verify the message in the configured mailbox or Mailtrap. Sandbox messages are not delivered to real customers.

Admin reply endpoints are `POST /api/admin/enquiries/:id/reply` and `POST /api/admin/consultations/:id/reply`; both send only to the email address already stored for that record. Provide JSON with `message` and optional `subject`.

## Project image management limits

The existing image API stores HTTP/HTTPS image URLs in MySQL; it is not a binary file-upload endpoint. `POST /api/admin/projects/:id/images` accepts `{ "image_url": "https://...", "sort_order": 0 }`. The URL must use HTTP or HTTPS. Existing image records are preserved. If actual file uploads are required for production, configure a dedicated storage provider or add a validated local upload implementation before deployment.

## Production checklist

- Set `CORS_ORIGINS` to the exact deployed frontend origin(s), with no wildcard.
- Use HTTPS, secure deployment secrets, and a production SMTP provider.
- Configure database backups and test restoration.
- Review reverse-proxy IP handling before relying on IP-based rate limiting.
- Run `npm run build`, `npm run db:test`, and functional API tests before release.
