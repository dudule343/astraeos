# Astraeos

SaaS pour agrégateurs patrimoniaux et conseillers en gestion de patrimoine — création d'études patrimoniales.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth)
- Déploiement : Vercel

## Démarrage

```bash
npm install
cp .env.local.example .env.local  # remplir les clés Supabase
npm run dev
```

## Structure

- `src/app/` — routes Next.js (App Router)
- `reference/wireframes/` — wireframes HTML d'origine (référence design)
