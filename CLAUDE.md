# Erinnear Industries — Claude Code Notes

## Dev Server

**Port:** 3000  
**Start command:** `npm run dev`

Before starting the dev server, always check if it's already running:

```bash
lsof -i :3000 | grep LISTEN
```

If already running → do NOT start another instance.  
If not running → start with `nohup` so it survives shell exit:

```bash
nohup npm run dev > /tmp/nextjs-dev.log 2>&1 &
echo $! > /tmp/nextjs-dev.pid
```

Then wait for "Ready" in the log before opening URLs:
```bash
tail -f /tmp/nextjs-dev.log
```

To kill: `pkill -f "next dev"` or `kill $(cat /tmp/nextjs-dev.pid)`

**URLs:**
- Main site: http://localhost:3000
- Admin: http://localhost:3000/admin
- Custom order page: http://localhost:3000/custom
- Admin orders: http://localhost:3000/admin/orders
- Pembukuan: http://localhost:3000/admin/pembukuan

## Tech Stack

- Next.js 15 App Router (Turbopack dev)
- Supabase (PostgreSQL + Storage bucket `images`)
- Midtrans (payment gateway, sandbox)
- TypeScript, CSS Modules via `app/globals.css` + `app/admin/admin.css`

## Database

Schema file: `supabase-schema.sql` — run manually in Supabase SQL Editor when adding new tables.  
Supabase project: `bzhwhvjuijofiuoujmgu`

## Storage

Bucket: `images` (public)  
Folders:
- `products/{id}/` — product photos
- `gallery/`, `showcase/` — CMS images  
- `custom-designs/` — uploaded customer design files

## Key Conventions

- Server Actions: `lib/actions.ts` (`'use server'`)
- Admin auth: `admin-token` cookie (httpOnly)
- User auth: `user-session` cookie (httpOnly)
- Admin CSS class prefix: `admin-`
- `admin-form-input` sizing: `padding: 0.7rem 0.9rem`, `border-radius: 10px`, `font-size: 0.875rem`
