/* ================================================
   QUIZZES "NORMALES" (sin @hoy) + ASIGNACIÓN USER
   ================================================ */

USE bd_bomberapp;

/* ╔══════════════════════════════════════════════╗
   ║ 1) RETO: Quiz A · Seguridad EPP (Mixto)     ║
   ╚══════════════════════════════════════════════╝ */
INSERT INTO retos (
  nombre_reto, descripcion_reto, tiempo_estimado_seg_reto,
  fecha_inicio_reto, fecha_fin_reto, es_automatico_reto,
  tipo_reto, metadata_reto, activo
)
SELECT
  'Quiz A · Seguridad EPP (Mixto)',
  'Uso correcto de EPP, conceptos básicos de seguridad.',
  300,
  '2025-09-01','2025-12-31',
  0,
  'quiz',
  NULL,   -- 🚫 sin metadata para quizzes
  1
WHERE NOT EXISTS (
  SELECT 1 FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)'
);

/* Pregunta A1 (ABCD) — 50 pts, 25s */
INSERT INTO preguntas (numero_pregunta, enunciado_pregunta, tipo_pregunta, puntos_pregunta, tiempo_max_pregunta, cod_reto)
SELECT 1, '¿Para qué sirve el casco de seguridad?', 'abcd', 50, 25,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM preguntas
  WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
    AND numero_pregunta=1
);
/* Opciones A1 */
INSERT INTO opciones_abcd (texto_opcion, validez_opcion, cod_pregunta)
SELECT 'Para decorar el uniforme', 0,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
           AND numero_pregunta=1)
UNION ALL
SELECT 'Para proteger la cabeza de impactos', 1,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
           AND numero_pregunta=1)
UNION ALL
SELECT 'Para identificar el rol del operario', 0,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
           AND numero_pregunta=1)
UNION ALL
SELECT 'Para reemplazar barandas y líneas de vida', 0,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
           AND numero_pregunta=1);

/* Pregunta A2 (ABCD) — 60 pts, 35s */
INSERT INTO preguntas (numero_pregunta, enunciado_pregunta, tipo_pregunta, puntos_pregunta, tiempo_max_pregunta, cod_reto)
SELECT 2, 'Cuando detectas una condición insegura, ¿qué debes hacer?', 'abcd', 60, 35,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM preguntas
  WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
    AND numero_pregunta=2
);
/* Opciones A2 */
INSERT INTO opciones_abcd (texto_opcion, validez_opcion, cod_pregunta)
SELECT 'Ignorarla si estás apurado', 0,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
           AND numero_pregunta=2)
UNION ALL
SELECT 'Reportarla y detener la actividad si es necesario', 1,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
           AND numero_pregunta=2)
UNION ALL
SELECT 'Esperar al final del turno para avisar', 0,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
           AND numero_pregunta=2)
UNION ALL
SELECT 'Tomar una foto para redes', 0,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
           AND numero_pregunta=2);

/* Pregunta A3 (Rellenar) — 40 pts, 20s */
INSERT INTO preguntas (numero_pregunta, enunciado_pregunta, tipo_pregunta, puntos_pregunta, tiempo_max_pregunta, cod_reto)
SELECT 3, 'Complete: Los guantes se usan para proteger las _________.', 'rellenar', 40, 20,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM preguntas
  WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
    AND numero_pregunta=3
);
INSERT INTO preguntas_rellenar (texto_pregunta, respuesta_correcta, cod_pregunta)
SELECT 'Los guantes se usan para proteger las _________.', 'manos',
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
           AND numero_pregunta=3)
WHERE NOT EXISTS (
  SELECT 1 FROM preguntas_rellenar
  WHERE cod_pregunta=(SELECT cod_pregunta FROM preguntas
                        WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
                          AND numero_pregunta=3)
);


/* ╔══════════════════════════════════════════════╗
   ║ 2) RETO: Quiz B · Orden y Señalización      ║
   ╚══════════════════════════════════════════════╝ */
INSERT INTO retos (
  nombre_reto, descripcion_reto, tiempo_estimado_seg_reto,
  fecha_inicio_reto, fecha_fin_reto, es_automatico_reto,
  tipo_reto, metadata_reto, activo
)
SELECT
  'Quiz B · Orden y Señalización',
  'Orden y aseo, señales y manejo básico de herramientas.',
  360,
  '2025-09-01','2025-12-31',
  0,
  'quiz',
  NULL,  -- 🚫 sin metadata para quizzes
  1
WHERE NOT EXISTS (
  SELECT 1 FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización'
);

/* Pregunta B1 (ABCD) — 55 pts, 40s */
INSERT INTO preguntas (numero_pregunta, enunciado_pregunta, tipo_pregunta, puntos_pregunta, tiempo_max_pregunta, cod_reto)
SELECT 1, 'Una zona marcada con cinta amarilla y negra normalmente indica…', 'abcd', 55, 40,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM preguntas
  WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1)
    AND numero_pregunta=1
);
/* Opciones B1 */
INSERT INTO opciones_abcd (texto_opcion, validez_opcion, cod_pregunta)
SELECT 'Área decorativa', 0,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1)
           AND numero_pregunta=1)
UNION ALL
SELECT 'Peligro o precaución', 1,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1)
           AND numero_pregunta=1)
UNION ALL
SELECT 'Ruta turística interna', 0,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1)
           AND numero_pregunta=1)
UNION ALL
SELECT 'Zona de parqueo VIP', 0,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1)
           AND numero_pregunta=1);

/* Pregunta B2 (Rellenar) — 45 pts, 25s */
INSERT INTO preguntas (numero_pregunta, enunciado_pregunta, tipo_pregunta, puntos_pregunta, tiempo_max_pregunta, cod_reto)
SELECT 2, 'Complete: Mantener el área de trabajo _________ reduce accidentes.', 'rellenar', 45, 25,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM preguntas
  WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1)
    AND numero_pregunta=2
);
INSERT INTO preguntas_rellenar (texto_pregunta, respuesta_correcta, cod_pregunta)
SELECT 'Mantener el área de trabajo _________ reduce accidentes.', 'limpia',
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1)
           AND numero_pregunta=2)
WHERE NOT EXISTS (
  SELECT 1 FROM preguntas_rellenar
  WHERE cod_pregunta=(SELECT cod_pregunta FROM preguntas
                        WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1)
                          AND numero_pregunta=2)
);

/* Pregunta B3 (ABCD) — 65 pts, 35s */
INSERT INTO preguntas (numero_pregunta, enunciado_pregunta, tipo_pregunta, puntos_pregunta, tiempo_max_pregunta, cod_reto)
SELECT 3, 'Para usar un esmeril, ¿qué EPP es indispensable además de guantes?', 'abcd', 65, 35,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM preguntas
  WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1)
    AND numero_pregunta=3
);
/* Opciones B3 */
INSERT INTO opciones_abcd (texto_opcion, validez_opcion, cod_pregunta)
SELECT 'Gafas de seguridad', 1,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1)
           AND numero_pregunta=3)
UNION ALL
SELECT 'Botas de caucho', 0,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1)
           AND numero_pregunta=3)
UNION ALL
SELECT 'Camiseta manga corta', 0,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1)
           AND numero_pregunta=3)
UNION ALL
SELECT 'Tapabocas quirúrgico', 0,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1)
           AND numero_pregunta=3);


/* ╔══════════════════════════════════════════════╗
   ║ 3) RETO: Quiz C · Primeros Auxilios         ║
   ╚══════════════════════════════════════════════╝ */
INSERT INTO retos (
  nombre_reto, descripcion_reto, tiempo_estimado_seg_reto,
  fecha_inicio_reto, fecha_fin_reto, es_automatico_reto,
  tipo_reto, metadata_reto, activo
)
SELECT
  'Quiz C · Primeros Auxilios',
  'Actuación inicial ante incidentes menores.',
  300,
  '2025-09-01','2025-12-31',
  0,
  'quiz',
  NULL,  -- 🚫 sin metadata para quizzes
  1
WHERE NOT EXISTS (
  SELECT 1 FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios'
);

/* Pregunta C1 (ABCD) — 50 pts, 30s */
INSERT INTO preguntas (numero_pregunta, enunciado_pregunta, tipo_pregunta, puntos_pregunta, tiempo_max_pregunta, cod_reto)
SELECT 1, 'Ante una cortada leve, lo primero que debes hacer es…', 'abcd', 50, 30,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM preguntas
  WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1)
    AND numero_pregunta=1
);
/* Opciones C1 */
INSERT INTO opciones_abcd (texto_opcion, validez_opcion, cod_pregunta)
SELECT 'Cubrir con tierra para coagular', 0,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1)
           AND numero_pregunta=1)
UNION ALL
SELECT 'Lavar con agua limpia y presionar con gasa', 1,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1)
           AND numero_pregunta=1)
UNION ALL
SELECT 'Aplicar pegante instantáneo', 0,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1)
           AND numero_pregunta=1)
UNION ALL
SELECT 'Ignorar si no duele', 0,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1)
           AND numero_pregunta=1);

/* Pregunta C2 (Rellenar) — 55 pts, 30s */
INSERT INTO preguntas (numero_pregunta, enunciado_pregunta, tipo_pregunta, puntos_pregunta, tiempo_max_pregunta, cod_reto)
SELECT 2, 'Complete: En caso de desmayo, verifique _________ antes de mover a la persona.', 'rellenar', 55, 30,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM preguntas
  WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1)
    AND numero_pregunta=2
);
INSERT INTO preguntas_rellenar (texto_pregunta, respuesta_correcta, cod_pregunta)
SELECT 'En caso de desmayo, verifique _________ antes de mover a la persona.', 'respiración',
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1)
           AND numero_pregunta=2)
WHERE NOT EXISTS (
  SELECT 1 FROM preguntas_rellenar
  WHERE cod_pregunta=(SELECT cod_pregunta FROM preguntas
                        WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1)
                          AND numero_pregunta=2)
);

/* Pregunta C3 (ABCD) — 60 pts, 35s */
INSERT INTO preguntas (numero_pregunta, enunciado_pregunta, tipo_pregunta, puntos_pregunta, tiempo_max_pregunta, cod_reto)
SELECT 3, '¿Qué no debes hacer ante una quemadura reciente?', 'abcd', 60, 35,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM preguntas
  WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1)
    AND numero_pregunta=3
);
/* Opciones C3 (dejadas como estaban en tu semilla) */
INSERT INTO opciones_abcd (texto_opcion, validez_opcion, cod_pregunta)
SELECT 'Aplicar hielo directamente', 0,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1)
           AND numero_pregunta=3)
UNION ALL
SELECT 'Reventar ampollas', 0,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1)
           AND numero_pregunta=3)
UNION ALL
SELECT 'Enfriar con agua a chorro por varios minutos', 1,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1)
           AND numero_pregunta=3)
UNION ALL
SELECT 'Cubrir suavemente con gasa estéril', 0,
       (SELECT cod_pregunta FROM preguntas
         WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1)
           AND numero_pregunta=3);


/* ╔══════════════════════════════════════════════╗
   ║ 4) ASIGNACIÓN simple a un usuario (ventana) ║
   ╚══════════════════════════════════════════════╝
   Asigna los 3 quizzes a burnice.white@gruasyequipos.com
   con la misma ventana para los tres.
*/
INSERT INTO usuarios_retos (cod_usuario, cod_reto, estado, ventana_inicio, ventana_fin)
SELECT
  u.cod_usuario,
  r.cod_reto,
  'asignado',
  '2025-09-07',
  '2025-10-31'
FROM usuarios u
JOIN retos r
  ON r.nombre_reto IN (
    'Quiz A · Seguridad EPP (Mixto)',
    'Quiz B · Orden y Señalización',
    'Quiz C · Primeros Auxilios'
  )
WHERE u.correo_usuario='burnice.white@gruasyequipos.com'
  AND NOT EXISTS (
    SELECT 1
    FROM usuarios_retos ur
    WHERE ur.cod_usuario = u.cod_usuario
      AND ur.cod_reto    = r.cod_reto
      AND ur.ventana_inicio = '2025-09-07'
      AND ur.ventana_fin    = '2025-10-31'
  );
  
  
USE bd_bomberapp;

/* =======================================================
   QUIZ A · Seguridad EPP (Mixto) — Pregunta A4 (Emparejar)
   ======================================================= */
-- Pregunta A4 — 70 pts, 45s
INSERT INTO preguntas (numero_pregunta, enunciado_pregunta, tipo_pregunta, puntos_pregunta, tiempo_max_pregunta, cod_reto)
SELECT 4, 'Empareja el EPP con su función principal', 'emparejar', 70, 45,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM preguntas
  WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
    AND numero_pregunta=4
);

-- Ítems lado A (EPP)
INSERT INTO items_emparejamiento (lado, contenido, cod_pregunta)
SELECT 'A', 'Casco',
       (SELECT cod_pregunta FROM preguntas
        WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
          AND numero_pregunta=4)
WHERE NOT EXISTS (
  SELECT 1 FROM items_emparejamiento i
  WHERE i.cod_pregunta=(SELECT cod_pregunta FROM preguntas
                        WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
                          AND numero_pregunta=4)
    AND i.lado='A' AND i.contenido='Casco'
);
INSERT INTO items_emparejamiento (lado, contenido, cod_pregunta)
SELECT 'A', 'Guantes',
       (SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1) AND numero_pregunta=4)
WHERE NOT EXISTS (SELECT 1 FROM items_emparejamiento WHERE cod_pregunta=(SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1) AND numero_pregunta=4) AND lado='A' AND contenido='Guantes');
INSERT INTO items_emparejamiento (lado, contenido, cod_pregunta)
SELECT 'A', 'Gafas',
       (SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1) AND numero_pregunta=4)
WHERE NOT EXISTS (SELECT 1 FROM items_emparejamiento WHERE cod_pregunta=(SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1) AND numero_pregunta=4) AND lado='A' AND contenido='Gafas');

-- Ítems lado B (función)
INSERT INTO items_emparejamiento (lado, contenido, cod_pregunta)
SELECT 'B', 'Proteger la cabeza',
       (SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1) AND numero_pregunta=4)
WHERE NOT EXISTS (SELECT 1 FROM items_emparejamiento WHERE cod_pregunta=(SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1) AND numero_pregunta=4) AND lado='B' AND contenido='Proteger la cabeza');
INSERT INTO items_emparejamiento (lado, contenido, cod_pregunta)
SELECT 'B', 'Proteger manos',
       (SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1) AND numero_pregunta=4)
WHERE NOT EXISTS (SELECT 1 FROM items_emparejamiento WHERE cod_pregunta=(SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1) AND numero_pregunta=4) AND lado='B' AND contenido='Proteger manos');
INSERT INTO items_emparejamiento (lado, contenido, cod_pregunta)
SELECT 'B', 'Proteger ojos',
       (SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1) AND numero_pregunta=4)
WHERE NOT EXISTS (SELECT 1 FROM items_emparejamiento WHERE cod_pregunta=(SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1) AND numero_pregunta=4) AND lado='B' AND contenido='Proteger ojos');

-- Parejas correctas
INSERT INTO parejas_correctas (cod_item_A, cod_item_B, cod_pregunta)
SELECT
  (SELECT ia.cod_item FROM items_emparejamiento ia WHERE ia.cod_pregunta=p.cod_pregunta AND ia.lado='A' AND ia.contenido='Casco'   LIMIT 1),
  (SELECT ib.cod_item FROM items_emparejamiento ib WHERE ib.cod_pregunta=p.cod_pregunta AND ib.lado='B' AND ib.contenido='Proteger la cabeza' LIMIT 1),
  p.cod_pregunta
FROM preguntas p
WHERE p.cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
  AND p.numero_pregunta=4
  AND NOT EXISTS (
    SELECT 1 FROM parejas_correctas pc WHERE pc.cod_pregunta=p.cod_pregunta
      AND pc.cod_item_A=(SELECT ia.cod_item FROM items_emparejamiento ia WHERE ia.cod_pregunta=p.cod_pregunta AND ia.lado='A' AND ia.contenido='Casco' LIMIT 1)
  );

INSERT INTO parejas_correctas (cod_item_A, cod_item_B, cod_pregunta)
SELECT
  (SELECT ia.cod_item FROM items_emparejamiento ia WHERE ia.cod_pregunta=p.cod_pregunta AND ia.lado='A' AND ia.contenido='Guantes' LIMIT 1),
  (SELECT ib.cod_item FROM items_emparejamiento ib WHERE ib.cod_pregunta=p.cod_pregunta AND ib.lado='B' AND ib.contenido='Proteger manos' LIMIT 1),
  p.cod_pregunta
FROM preguntas p
WHERE p.cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
  AND p.numero_pregunta=4
  AND NOT EXISTS (
    SELECT 1 FROM parejas_correctas pc WHERE pc.cod_pregunta=p.cod_pregunta
      AND pc.cod_item_A=(SELECT ia.cod_item FROM items_emparejamiento ia WHERE ia.cod_pregunta=p.cod_pregunta AND ia.lado='A' AND ia.contenido='Guantes' LIMIT 1)
  );

INSERT INTO parejas_correctas (cod_item_A, cod_item_B, cod_pregunta)
SELECT
  (SELECT ia.cod_item FROM items_emparejamiento ia WHERE ia.cod_pregunta=p.cod_pregunta AND ia.lado='A' AND ia.contenido='Gafas' LIMIT 1),
  (SELECT ib.cod_item FROM items_emparejamiento ib WHERE ib.cod_pregunta=p.cod_pregunta AND ib.lado='B' AND ib.contenido='Proteger ojos' LIMIT 1),
  p.cod_pregunta
FROM preguntas p
WHERE p.cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz A · Seguridad EPP (Mixto)' LIMIT 1)
  AND p.numero_pregunta=4
  AND NOT EXISTS (
    SELECT 1 FROM parejas_correctas pc WHERE pc.cod_pregunta=p.cod_pregunta
      AND pc.cod_item_A=(SELECT ia.cod_item FROM items_emparejamiento ia WHERE ia.cod_pregunta=p.cod_pregunta AND ia.lado='A' AND ia.contenido='Gafas' LIMIT 1)
  );

/* ========================================================
   QUIZ B · Orden y Señalización — Pregunta B4 (Emparejar)
   ======================================================== */
-- B4 — 80 pts, 50s
INSERT INTO preguntas (numero_pregunta, enunciado_pregunta, tipo_pregunta, puntos_pregunta, tiempo_max_pregunta, cod_reto)
SELECT 4, 'Une la señal con su significado', 'emparejar', 80, 50,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM preguntas
  WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1)
    AND numero_pregunta=4
);
-- A
INSERT INTO items_emparejamiento (lado, contenido, cod_pregunta)
SELECT 'A','Amarillo/Negro', (SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1) AND numero_pregunta=4)
WHERE NOT EXISTS (SELECT 1 FROM items_emparejamiento WHERE lado='A' AND contenido='Amarillo/Negro' AND cod_pregunta=(SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1) AND numero_pregunta=4));
INSERT INTO items_emparejamiento (lado, contenido, cod_pregunta)
SELECT 'A','Rojo', (SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1) AND numero_pregunta=4)
WHERE NOT EXISTS (SELECT 1 FROM items_emparejamiento WHERE lado='A' AND contenido='Rojo' AND cod_pregunta=(SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1) AND numero_pregunta=4));
INSERT INTO items_emparejamiento (lado, contenido, cod_pregunta)
SELECT 'A','Verde', (SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1) AND numero_pregunta=4)
WHERE NOT EXISTS (SELECT 1 FROM items_emparejamiento WHERE lado='A' AND contenido='Verde' AND cod_pregunta=(SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1) AND numero_pregunta=4));
-- B
INSERT INTO items_emparejamiento (lado, contenido, cod_pregunta)
SELECT 'B','Peligro/precaución', (SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1) AND numero_pregunta=4)
WHERE NOT EXISTS (SELECT 1 FROM items_emparejamiento WHERE lado='B' AND contenido='Peligro/precaución' AND cod_pregunta=(SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1) AND numero_pregunta=4));
INSERT INTO items_emparejamiento (lado, contenido, cod_pregunta)
SELECT 'B','Prohibición/alto', (SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1) AND numero_pregunta=4)
WHERE NOT EXISTS (SELECT 1 FROM items_emparejamiento WHERE lado='B' AND contenido='Prohibición/alto' AND cod_pregunta=(SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1) AND numero_pregunta=4));
INSERT INTO items_emparejamiento (lado, contenido, cod_pregunta)
SELECT 'B','Emergencia/salida', (SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1) AND numero_pregunta=4)
WHERE NOT EXISTS (SELECT 1 FROM items_emparejamiento WHERE lado='B' AND contenido='Emergencia/salida' AND cod_pregunta=(SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1) AND numero_pregunta=4));
-- Parejas
INSERT INTO parejas_correctas (cod_item_A, cod_item_B, cod_pregunta)
SELECT
  (SELECT ia.cod_item FROM items_emparejamiento ia WHERE ia.cod_pregunta=p.cod_pregunta AND ia.lado='A' AND ia.contenido='Amarillo/Negro' LIMIT 1),
  (SELECT ib.cod_item FROM items_emparejamiento ib WHERE ib.cod_pregunta=p.cod_pregunta AND ib.lado='B' AND ib.contenido='Peligro/precaución' LIMIT 1),
  p.cod_pregunta
FROM preguntas p
WHERE p.cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1) AND p.numero_pregunta=4
  AND NOT EXISTS (SELECT 1 FROM parejas_correctas pc WHERE pc.cod_pregunta=p.cod_pregunta AND pc.cod_item_A=(SELECT ia.cod_item FROM items_emparejamiento ia WHERE ia.cod_pregunta=p.cod_pregunta AND ia.lado='A' AND ia.contenido='Amarillo/Negro' LIMIT 1));

INSERT INTO parejas_correctas (cod_item_A, cod_item_B, cod_pregunta)
SELECT
  (SELECT ia.cod_item FROM items_emparejamiento ia WHERE ia.cod_pregunta=p.cod_pregunta AND ia.lado='A' AND ia.contenido='Rojo' LIMIT 1),
  (SELECT ib.cod_item FROM items_emparejamiento ib WHERE ib.cod_pregunta=p.cod_pregunta AND ib.lado='B' AND ib.contenido='Prohibición/alto' LIMIT 1),
  p.cod_pregunta
FROM preguntas p
WHERE p.cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1) AND p.numero_pregunta=4
  AND NOT EXISTS (SELECT 1 FROM parejas_correctas pc WHERE pc.cod_pregunta=p.cod_pregunta AND pc.cod_item_A=(SELECT ia.cod_item FROM items_emparejamiento ia WHERE ia.cod_pregunta=p.cod_pregunta AND ia.lado='A' AND ia.contenido='Rojo' LIMIT 1));

INSERT INTO parejas_correctas (cod_item_A, cod_item_B, cod_pregunta)
SELECT
  (SELECT ia.cod_item FROM items_emparejamiento ia WHERE ia.cod_pregunta=p.cod_pregunta AND ia.lado='A' AND ia.contenido='Verde' LIMIT 1),
  (SELECT ib.cod_item FROM items_emparejamiento ib WHERE ib.cod_pregunta=p.cod_pregunta AND ib.lado='B' AND ib.contenido='Emergencia/salida' LIMIT 1),
  p.cod_pregunta
FROM preguntas p
WHERE p.cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz B · Orden y Señalización' LIMIT 1) AND p.numero_pregunta=4
  AND NOT EXISTS (SELECT 1 FROM parejas_correctas pc WHERE pc.cod_pregunta=p.cod_pregunta AND pc.cod_item_A=(SELECT ia.cod_item FROM items_emparejamiento ia WHERE ia.cod_pregunta=p.cod_pregunta AND ia.lado='A' AND ia.contenido='Verde' LIMIT 1));

/* =====================================================
   QUIZ C · Primeros Auxilios — Pregunta C4 (Emparejar)
   ===================================================== */
-- C4 — 75 pts, 50s
INSERT INTO preguntas (numero_pregunta, enunciado_pregunta, tipo_pregunta, puntos_pregunta, tiempo_max_pregunta, cod_reto)
SELECT 4, 'Relaciona situación con acción inmediata', 'emparejar', 75, 50,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM preguntas
  WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1)
    AND numero_pregunta=4
);

-- A
INSERT INTO items_emparejamiento (lado, contenido, cod_pregunta)
SELECT 'A','Cortada leve', (SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1) AND numero_pregunta=4)
WHERE NOT EXISTS (SELECT 1 FROM items_emparejamiento WHERE lado='A' AND contenido='Cortada leve' AND cod_pregunta=(SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1) AND numero_pregunta=4));
INSERT INTO items_emparejamiento (lado, contenido, cod_pregunta)
SELECT 'A','Quemadura reciente', (SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1) AND numero_pregunta=4)
WHERE NOT EXISTS (SELECT 1 FROM items_emparejamiento WHERE lado='A' AND contenido='Quemadura reciente' AND cod_pregunta=(SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1) AND numero_pregunta=4));
INSERT INTO items_emparejamiento (lado, contenido, cod_pregunta)
SELECT 'A','Desmayo', (SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1) AND numero_pregunta=4)
WHERE NOT EXISTS (SELECT 1 FROM items_emparejamiento WHERE lado='A' AND contenido='Desmayo' AND cod_pregunta=(SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1) AND numero_pregunta=4));

-- B
INSERT INTO items_emparejamiento (lado, contenido, cod_pregunta)
SELECT 'B','Lavar con agua + gasa', (SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1) AND numero_pregunta=4)
WHERE NOT EXISTS (SELECT 1 FROM items_emparejamiento WHERE lado='B' AND contenido='Lavar con agua + gasa' AND cod_pregunta=(SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1) AND numero_pregunta=4));
INSERT INTO items_emparejamiento (lado, contenido, cod_pregunta)
SELECT 'B','Enfriar con agua a chorro', (SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1) AND numero_pregunta=4)
WHERE NOT EXISTS (SELECT 1 FROM items_emparejamiento WHERE lado='B' AND contenido='Enfriar con agua a chorro' AND cod_pregunta=(SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1) AND numero_pregunta=4));
INSERT INTO items_emparejamiento (lado, contenido, cod_pregunta)
SELECT 'B','Verificar respiración', (SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1) AND numero_pregunta=4)
WHERE NOT EXISTS (SELECT 1 FROM items_emparejamiento WHERE lado='B' AND contenido='Verificar respiración' AND cod_pregunta=(SELECT cod_pregunta FROM preguntas WHERE cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1) AND numero_pregunta=4));

-- Parejas
INSERT INTO parejas_correctas (cod_item_A, cod_item_B, cod_pregunta)
SELECT
  (SELECT ia.cod_item FROM items_emparejamiento ia WHERE ia.cod_pregunta=p.cod_pregunta AND ia.lado='A' AND ia.contenido='Cortada leve' LIMIT 1),
  (SELECT ib.cod_item FROM items_emparejamiento ib WHERE ib.cod_pregunta=p.cod_pregunta AND ib.lado='B' AND ib.contenido='Lavar con agua + gasa' LIMIT 1),
  p.cod_pregunta
FROM preguntas p
WHERE p.cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1) AND p.numero_pregunta=4
  AND NOT EXISTS (SELECT 1 FROM parejas_correctas pc WHERE pc.cod_pregunta=p.cod_pregunta AND pc.cod_item_A=(SELECT ia.cod_item FROM items_emparejamiento ia WHERE ia.cod_pregunta=p.cod_pregunta AND ia.lado='A' AND ia.contenido='Cortada leve' LIMIT 1));

INSERT INTO parejas_correctas (cod_item_A, cod_item_B, cod_pregunta)
SELECT
  (SELECT ia.cod_item FROM items_emparejamiento ia WHERE ia.cod_pregunta=p.cod_pregunta AND ia.lado='A' AND ia.contenido='Quemadura reciente' LIMIT 1),
  (SELECT ib.cod_item FROM items_emparejamiento ib WHERE ib.cod_pregunta=p.cod_pregunta AND ib.lado='B' AND ib.contenido='Enfriar con agua a chorro' LIMIT 1),
  p.cod_pregunta
FROM preguntas p
WHERE p.cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1) AND p.numero_pregunta=4
  AND NOT EXISTS (SELECT 1 FROM parejas_correctas pc WHERE pc.cod_pregunta=p.cod_pregunta AND pc.cod_item_A=(SELECT ia.cod_item FROM items_emparejamiento ia WHERE ia.cod_pregunta=p.cod_pregunta AND ia.lado='A' AND ia.contenido='Quemadura reciente' LIMIT 1));

INSERT INTO parejas_correctas (cod_item_A, cod_item_B, cod_pregunta)
SELECT
  (SELECT ia.cod_item FROM items_emparejamiento ia WHERE ia.cod_pregunta=p.cod_pregunta AND ia.lado='A' AND ia.contenido='Desmayo' LIMIT 1),
  (SELECT ib.cod_item FROM items_emparejamiento ib WHERE ib.cod_pregunta=p.cod_pregunta AND ib.lado='B' AND ib.contenido='Verificar respiración' LIMIT 1),
  p.cod_pregunta
FROM preguntas p
WHERE p.cod_reto=(SELECT cod_reto FROM retos WHERE nombre_reto='Quiz C · Primeros Auxilios' LIMIT 1) AND p.numero_pregunta=4
  AND NOT EXISTS (SELECT 1 FROM parejas_correctas pc WHERE pc.cod_pregunta=p.cod_pregunta AND pc.cod_item_A=(SELECT ia.cod_item FROM items_emparejamiento ia WHERE ia.cod_pregunta=p.cod_pregunta AND ia.lado='A' AND ia.contenido='Desmayo' LIMIT 1));

