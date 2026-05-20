# 🚀 Guida Deploy — La Mia Cantina Supabase Edition

## Architettura

```
Browser  ──►  cantina-supabase.html  (Netlify / GitHub Pages)
                      │
                      ▼
              Supabase (database cloud PostgreSQL gratuito)
                      │
                      ▼
              Perplexity API (schede tecniche)
```

---

## STEP 1 — Crea il database su Supabase (gratuito)

### 1.1 Registrati e crea un progetto
1. Vai su **https://supabase.com** e crea un account gratuito
2. Clicca **"New project"**
3. Scegli un nome (es. `la-mia-cantina`), una password e la regione **Europe (Frankfurt)** per velocità ottimale dall'Italia
4. Attendi ~2 minuti la creazione del progetto

### 1.2 Crea la tabella `wines`
1. Nel menu laterale vai su **SQL Editor**
2. Clicca **"New query"** e incolla questo SQL:

```sql
-- Crea la tabella wines
CREATE TABLE IF NOT EXISTS public.wines (
  id          TEXT PRIMARY KEY,
  wine_data   JSONB NOT NULL DEFAULT '{}',
  created_at  BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- Abilita Row Level Security (RLS)
ALTER TABLE public.wines ENABLE ROW LEVEL SECURITY;

-- Policy: accesso pubblico (app personale con anon key)
-- Per un'app personale, questa policy consente tutte le operazioni.
-- Se vuoi proteggere i dati, vedi la sezione "Sicurezza avanzata" più in basso.
CREATE POLICY "allow_all" ON public.wines
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

3. Clicca **"Run"** — la tabella è pronta ✅

### 1.3 Recupera URL e chiave API
1. Nel menu laterale vai su **Settings → API**
2. Copia:
   - **Project URL** → es. `https://abcdefghij.supabase.co`
   - **anon public** key → lunga stringa che inizia con `eyJ...`

---

## STEP 2 — Pubblica l'app su Netlify (gratuito)

### Opzione A — Drag & Drop (più semplice, nessun account GitHub necessario)
1. Vai su **https://netlify.com** e crea un account gratuito
2. Nella dashboard clicca **"Add new site" → "Deploy manually"**
3. Trascina la **cartella** `cantina-supabase` (con il file `.html` dentro) nella zona di drop
4. Netlify pubblica in ~30 secondi e ti fornisce un URL tipo `https://amazing-name-123.netlify.app`
5. Puoi rinominare il sito in **Site settings → Site details → Change site name**

### Opzione B — Via GitHub (aggiornamento automatico)
1. Crea un repository su **https://github.com** (può essere privato)
2. Carica il file `cantina-supabase.html` nel repository
3. Su Netlify: **"Add new site" → "Import an existing project" → GitHub**
4. Seleziona il repository — Netlify pubblica automaticamente ad ogni modifica

---

## STEP 3 — Configura l'app

1. Apri l'URL pubblicato da Netlify nel browser
2. Clicca il bottone **⚙️ Impostazioni** in alto a destra
3. Incolla:
   - **Supabase Project URL** (da Step 1.3)
   - **Supabase Anon Key** (da Step 1.3)
   - **Perplexity API Key** (da https://www.perplexity.ai/settings/api)
4. Clicca **"💾 Salva & Connetti"**
5. Il banner in cima diventa verde: **"☁️ Supabase connesso"** ✅

---

## STEP 4 — Usa l'app da qualsiasi dispositivo

- Apri lo stesso URL Netlify da PC, Mac, tablet o smartphone
- I dati sono nel cloud Supabase — sincronizzati ovunque in tempo reale
- Nessun server locale da avviare, nessun file da copiare

---

## Sicurezza avanzata (opzionale)

La configurazione base usa una policy "allow all" — chiunque abbia l'URL e l'anon key può leggere/scrivere i dati. Per un'app personale è accettabile (l'anon key non è un segreto, ma l'URL del progetto non è pubblicamente noto).

Se vuoi maggiore sicurezza, puoi:

### Opzione 1 — Restringere per IP (Supabase Pro)
Disponibile solo nei piani a pagamento.

### Opzione 2 — Autenticazione (gratuita)
Aggiungi Supabase Auth per richiedere login:
```sql
-- Sostituisci la policy "allow_all" con:
DROP POLICY IF EXISTS "allow_all" ON public.wines;

CREATE POLICY "authenticated_only" ON public.wines
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```
Poi implementa il login nell'HTML (richiede modifiche al codice JS).

---

## Backup dei dati

### Esporta in Excel
Clicca il bottone **⬇ Esporta** nell'app — scarica un file `.xlsx` con tutti i vini.

### Backup Supabase
In Supabase Dashboard → **Settings → Database → Backups** (disponibile automaticamente nei piani a pagamento; nel piano free puoi fare dump manuale via SQL Editor):
```sql
SELECT * FROM wines;
```

---

## Limiti piano gratuito Supabase

| Risorsa | Limite Free |
|---------|-------------|
| Database | 500 MB |
| Richieste API | 2 milioni/mese |
| Larghezza di banda | 5 GB/mese |
| Progetti attivi | 2 |

Per una cantina personale con centinaia di vini, il piano gratuito è più che sufficiente.

---

## Risoluzione problemi

| Problema | Soluzione |
|----------|-----------|
| Banner rosso "Errore connessione Supabase" | Verifica URL e anon key in ⚙️ Impostazioni. L'URL deve iniziare con `https://` e finire con `.supabase.co` |
| "relation 'wines' does not exist" | Esegui di nuovo lo script SQL di Step 1.2 |
| La scheda tecnica non si genera | Verifica che la Perplexity API Key in ⚙️ sia corretta e inizi con `pplx-` |
| I dati non compaiono su un altro dispositivo | Assicurati di aver inserito le stesse credenziali Supabase su quel dispositivo |
| App lenta al primo caricamento | Normale — Netlify CDN + Supabase possono impiegare 1-2s al primo accesso |
