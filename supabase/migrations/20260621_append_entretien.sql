-- Fonction RPC append_entretien : append ATOMIQUE borné des champs d'un entretien.
-- Le cockpit visio (src/lib/entretiens-store.ts → supabase.rpc('append_entretien'))
-- l'appelle à chaque flush (transcription, conseils IA, articles, notes, DCI).
-- Sans cette fonction, l'appel échoue → repli sur un fichier local éphémère
-- (perdu sur Vercel serverless) → l'édition du DCI en live n'était PAS persistée.
--
-- Un seul UPDATE avec `jsonb ||` borné en queue : deux PATCH concurrents
-- (flush transcript + flush insights + dci-extract) ne s'écrasent plus.

-- Garde les N derniers éléments d'un tableau jsonb, ordre d'origine préservé.
CREATE OR REPLACE FUNCTION public.cap_tail(arr jsonb, n int)
RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN arr IS NULL THEN '[]'::jsonb
    WHEN jsonb_array_length(arr) <= n THEN arr
    ELSE (
      SELECT COALESCE(jsonb_agg(elem ORDER BY ord), '[]'::jsonb)
      FROM (
        SELECT elem, ord
        FROM jsonb_array_elements(arr) WITH ORDINALITY AS t(elem, ord)
        ORDER BY ord DESC
        LIMIT n
      ) s
    )
  END;
$$;

CREATE OR REPLACE FUNCTION public.append_entretien(
  p_id uuid,
  p_transcript jsonb DEFAULT '[]'::jsonb,
  p_conseils jsonb DEFAULT '[]'::jsonb,
  p_articles jsonb DEFAULT '[]'::jsonb,
  p_notes jsonb DEFAULT '[]'::jsonb,
  p_dci jsonb DEFAULT NULL,
  p_transcript_cap int DEFAULT 2000,
  p_conseils_cap int DEFAULT 200,
  p_articles_cap int DEFAULT 200,
  p_notes_cap int DEFAULT 500
) RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE v_rows int;
BEGIN
  UPDATE public.entretiens e SET
    transcript = public.cap_tail(COALESCE(e.transcript, '[]'::jsonb) || COALESCE(p_transcript, '[]'::jsonb), p_transcript_cap),
    conseils   = public.cap_tail(COALESCE(e.conseils,   '[]'::jsonb) || COALESCE(p_conseils,   '[]'::jsonb), p_conseils_cap),
    articles   = public.cap_tail(COALESCE(e.articles,   '[]'::jsonb) || COALESCE(p_articles,   '[]'::jsonb), p_articles_cap),
    notes      = public.cap_tail(COALESCE(e.notes,      '[]'::jsonb) || COALESCE(p_notes,      '[]'::jsonb), p_notes_cap),
    dci_snapshot = COALESCE(p_dci, e.dci_snapshot),
    updated_at = now()
  WHERE e.id = p_id;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$$;
