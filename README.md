# Atelier Noire — Animation & Project Layout Fix

This version is based on the supplied AN3D project and keeps the existing frontend/backend structure.

## Fixed in this pass
- Removed the Studio “A studio built around curiosity.” section and its background image.
- Project cards use one consistent 4:5 image frame; no staggered vertical offsets or mixed image heights.
- Home and Portfolio project grids are 4 columns on desktop, 3 on medium, 2 on tablet and 1 on mobile.
- Scroll reveals replay when content re-enters the viewport, instead of animating only once.
- Project cards animate individually as they enter the viewport.
- Journal, team, process, service and project-detail content continues to reveal progressively.
- Project detail case gallery is now one controlled image area.
- Project detail images rotate every 3 seconds in the same frame.
- Carousel uses Framer Motion `mode="wait"`, so the outgoing image leaves before the next image becomes visible; no side-by-side/overlapping carousel images.
- Route scroll-to-top behavior remains enabled in `Layout.jsx`.

## Run

```powershell
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Production build

```powershell
npm install
npm run build
```

## Backend

The existing backend/API/database files from the supplied project are preserved. Configure `server/.env` from `server/.env.example` before database/email testing.


## UX-only update in this package
- Route navigation resets the scroll position to the top, including browser scroll restoration.
- Content uses repeatable viewport reveals so sections re-animate when scrolling up and down.
- Project grids keep consistent card sizing with no staggered vertical offsets.
- Admin login cycles through five subtle luxury colour themes every 3 seconds.
- Existing pages, backend, and database structure are preserved; these are additive UI/UX fixes.


## PDF UX pass
Retained the existing luxury UI and motion system; added portfolio discovery/category filtering, service icons, clearer process guidance, testimonial cards, single consultation form on Contact, project brief on Begin a Project, project-specific category reels, and existing backend API integration.
