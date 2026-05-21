import { sql } from '@vercel/postgres';

export { sql as db };

export async function runMigrations() {
  await sql`
    CREATE TABLE IF NOT EXISTS picks (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      date        DATE NOT NULL,
      sport       VARCHAR(4) NOT NULL,
      home_team   VARCHAR(100) NOT NULL,
      away_team   VARCHAR(100) NOT NULL,
      bet_type    VARCHAR(20) NOT NULL,
      bet_description TEXT NOT NULL,
      odds        VARCHAR(10) NOT NULL,
      units       NUMERIC(3,1) NOT NULL DEFAULT 1,
      confidence  INTEGER NOT NULL,
      reasoning   TEXT NOT NULL,
      result      VARCHAR(10) NOT NULL DEFAULT 'pending',
      result_description TEXT,
      posted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS push_tokens (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      whop_user_id VARCHAR(100) NOT NULL,
      push_token  TEXT NOT NULL UNIQUE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(whop_user_id, push_token)
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS picks_date_idx ON picks (date DESC);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS picks_sport_idx ON picks (sport);
  `;
}
