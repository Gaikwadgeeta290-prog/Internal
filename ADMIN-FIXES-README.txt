ATELIER NOIRE - ADMIN FIX NOTES

Changes included:
1. Removed the static header Admin profile block and replaced it with a top-right clickable profile button.
2. Profile opens a right-side drawer and closes with its close button or by clicking the overlay. It displays the email saved in atelier_admin_email and a logout action. This project ZIP does not expose a verified admin /me profile endpoint, so name/avatar image upload is not fabricated.
3. Added customer quotation/payment preference to BeginProject.jsx. Backend must also persist this field to retain it in the database; inspect /api/contact before assuming it is saved.
4. The uploaded backend already includes POST /api/admin/consultations/:id/reply and the frontend calls it with {subject, message}. Email delivery still requires valid SMTP settings in backend/.env.

IMPORTANT:
- Existing typography rules were not intentionally changed. Profile styles inherit current fonts.
- This uploaded ZIP does NOT contain QuotationsPayments.jsx or quotation API routes, even though the screenshot appears to be from a newer/different working folder. Therefore the quotation form validation/save error shown in the screenshot cannot be fixed in this ZIP's code. Do not overwrite your newer working folder with this archive if it contains quotation files.
- For local development, vite.config.js proxies /api to http://localhost:5050. Start backend and frontend. Check http://localhost:5050/api/health. If SMTP reply fails with 503/502, configure backend/.env using backend/.env.example and valid SMTP credentials.
