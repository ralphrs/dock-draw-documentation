-- Roteiro de verificação da migração 0005 (DDP-308): bucket diagram-images e duas políticas.
-- Só leitura. Termina sempre em RAISE EXCEPTION 'VEREDITO: ...'.
DO $$
DECLARE
  falhas text[] := '{}';
  b record;
  n int;
BEGIN
  SELECT public, file_size_limit, allowed_mime_types INTO b
    FROM storage.buckets WHERE id = 'diagram-images';
  IF NOT FOUND THEN
    falhas := array_append(falhas, 'bucket diagram-images não existe'::text);
  ELSE
    IF b.public THEN falhas := array_append(falhas, 'bucket está público'::text); END IF;
    IF b.file_size_limit IS DISTINCT FROM 5242880 THEN falhas := array_append(falhas, ('file_size_limit = ' || coalesce(b.file_size_limit::text, 'null'))::text); END IF;
    IF b.allowed_mime_types IS NULL
       OR NOT (b.allowed_mime_types @> ARRAY['image/png','image/jpeg','image/webp']
               AND ARRAY['image/png','image/jpeg','image/webp'] @> b.allowed_mime_types) THEN
      falhas := array_append(falhas, ('allowed_mime_types = ' || coalesce(b.allowed_mime_types::text, 'null'))::text);
    END IF;
  END IF;

  SELECT count(*) INTO n FROM pg_policies
   WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'diagram_images_select'
     AND cmd = 'SELECT' AND qual LIKE '%diagram-images%' AND qual LIKE '%can_access_project%';
  IF n <> 1 THEN falhas := array_append(falhas, 'política diagram_images_select ausente ou diferente'::text); END IF;

  SELECT count(*) INTO n FROM pg_policies
   WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'diagram_images_insert'
     AND cmd = 'INSERT' AND with_check LIKE '%diagram-images%' AND with_check LIKE '%can_access_project%'
     AND with_check LIKE '%extension(name)%';
  IF n <> 1 THEN falhas := array_append(falhas, 'política diagram_images_insert ausente ou diferente'::text); END IF;

  SELECT count(*) INTO n FROM pg_policies
   WHERE schemaname = 'storage' AND tablename = 'objects'
     AND cmd IN ('DELETE','UPDATE','ALL')
     AND (coalesce(qual,'') || coalesce(with_check,'')) LIKE '%diagram-images%';
  IF n > 0 THEN falhas := array_append(falhas, 'existe política de DELETE, UPDATE ou ALL no bucket'::text); END IF;

  IF array_length(falhas, 1) IS NULL THEN
    RAISE EXCEPTION 'VEREDITO: VERDE';
  ELSE
    RAISE EXCEPTION 'VEREDITO: VERMELHO: %', array_to_string(falhas, '; ');
  END IF;
END $$;
