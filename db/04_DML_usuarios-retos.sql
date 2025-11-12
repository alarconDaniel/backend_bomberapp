-- Ayuditas: consigue IDs por nombre (no necesitas copiarlos; son subselects en cada insert)
-- SELECT cod_usuario, nickname_usuario FROM usuarios;
-- SELECT cod_reto, nombre_reto FROM retos;

-- ================
-- Burnice (BomberMan)
-- ================
-- Multi-día: Check operacional de bombeo (semana pasada → próxima)
INSERT INTO usuarios_retos (cod_usuario, cod_reto, ventana_inicio, ventana_fin, estado, empezado_en)
SELECT u.cod_usuario,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Check operacional de bombeo'),
       '2025-08-18','2025-08-29','en_progreso','2025-08-22 08:10:00'
FROM usuarios u
WHERE u.nickname_usuario='BESTOPiromanaCoctelera'
  AND NOT EXISTS (
    SELECT 1 FROM usuarios_retos ur
    WHERE ur.cod_usuario = u.cod_usuario
      AND ur.cod_reto = (SELECT cod_reto FROM retos WHERE nombre_reto='Check operacional de bombeo')
      AND ur.ventana_inicio='2025-08-18' AND ur.ventana_fin='2025-08-29'
  );

-- Single-day: Inventarios de mangueras con fotos (ayer)
INSERT INTO usuarios_retos (cod_usuario, cod_reto, fecha_objetivo, estado)
SELECT u.cod_usuario,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Inventarios de mangueras con fotos'),
       '2025-08-22','asignado'
FROM usuarios u
WHERE u.nickname_usuario='BESTOPiromanaCoctelera'
  AND NOT EXISTS (
    SELECT 1 FROM usuarios_retos ur
    WHERE ur.cod_usuario = u.cod_usuario
      AND ur.cod_reto = (SELECT cod_reto FROM retos WHERE nombre_reto='Inventarios de mangueras con fotos')
      AND ur.fecha_objetivo='2025-08-22'
  );

-- ================
-- Luciana (BomberMan)
-- ================
-- Multi-día: Check operacional de bombeo (mismo rango) COMPLETADO
INSERT INTO usuarios_retos (cod_usuario, cod_reto, ventana_inicio, ventana_fin, estado, empezado_en, terminado_en, fecha_complecion)
SELECT u.cod_usuario,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Check operacional de bombeo'),
       '2025-08-18','2025-08-29','completado','2025-08-19 09:00:00','2025-08-19 10:30:00','2025-08-19 10:30:00'
FROM usuarios u
WHERE u.nickname_usuario='HomeRUN!'
  AND NOT EXISTS (
    SELECT 1 FROM usuarios_retos ur
    WHERE ur.cod_usuario = u.cod_usuario
      AND ur.cod_reto = (SELECT cod_reto FROM retos WHERE nombre_reto='Check operacional de bombeo')
      AND ur.ventana_inicio='2025-08-18' AND ur.ventana_fin='2025-08-29'
  );

-- Multi-día: Inventarios de equipo y accesorios (15→25) ABANDONADO
INSERT INTO usuarios_retos (cod_usuario, cod_reto, ventana_inicio, ventana_fin, estado, empezado_en, terminado_en)
SELECT u.cod_usuario,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Inventarios de equipo y accesorios por obra (marcación tubería)'),
       '2025-08-15','2025-08-25','abandonado','2025-08-20 08:00:00','2025-08-20 08:40:00'
FROM usuarios u
WHERE u.nickname_usuario='HomeRUN!'
  AND NOT EXISTS (
    SELECT 1 FROM usuarios_retos ur
    WHERE ur.cod_usuario = u.cod_usuario
      AND ur.cod_reto = (SELECT cod_reto FROM retos WHERE nombre_reto='Inventarios de equipo y accesorios por obra (marcación tubería)')
      AND ur.ventana_inicio='2025-08-15' AND ur.ventana_fin='2025-08-25'
  );

-- ================
-- Jane (GruaMan)
-- ================
-- Multi-día: Inventario de radios (18→23) COMPLETADO
INSERT INTO usuarios_retos (cod_usuario, cod_reto, ventana_inicio, ventana_fin, estado, empezado_en, terminado_en, fecha_complecion)
SELECT u.cod_usuario,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Inventario de radios'),
       '2025-08-18','2025-08-23','completado','2025-08-21 07:15:00','2025-08-21 08:00:00','2025-08-21 08:00:00'
FROM usuarios u
WHERE u.nickname_usuario='ElAmorDeTuVida'
  AND NOT EXISTS (
    SELECT 1 FROM usuarios_retos ur
    WHERE ur.cod_usuario = u.cod_usuario
      AND ur.cod_reto = (SELECT cod_reto FROM retos WHERE nombre_reto='Inventario de radios')
      AND ur.ventana_inicio='2025-08-18' AND ur.ventana_fin='2025-08-23'
  );

-- Multi-día: Kit mantenimientos bombas (19→24) EN_PROGRESO
INSERT INTO usuarios_retos (cod_usuario, cod_reto, ventana_inicio, ventana_fin, estado, empezado_en)
SELECT u.cod_usuario,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Kit mantenimientos bombas'),
       '2025-08-19','2025-08-24','en_progreso','2025-08-22 09:30:00'
FROM usuarios u
WHERE u.nickname_usuario='ElAmorDeTuVida'
  AND NOT EXISTS (
    SELECT 1 FROM usuarios_retos ur
    WHERE ur.cod_usuario = u.cod_usuario
      AND ur.cod_reto = (SELECT cod_reto FROM retos WHERE nombre_reto='Kit mantenimientos bombas')
      AND ur.ventana_inicio='2025-08-19' AND ur.ventana_fin='2025-08-24'
  );

-- ================
-- Alice (GruaMan)
-- ================
-- Single-day: Información de m3 por pieza desgaste (21/08) COMPLETADO
INSERT INTO usuarios_retos (cod_usuario, cod_reto, fecha_objetivo, estado, empezado_en, terminado_en, fecha_complecion)
SELECT u.cod_usuario,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Información de m3 por pieza desgaste'),
       '2025-08-21','completado','2025-08-21 10:00:00','2025-08-21 11:05:00','2025-08-21 11:05:00'
FROM usuarios u
WHERE u.nickname_usuario='Arenera'
  AND NOT EXISTS (
    SELECT 1 FROM usuarios_retos ur
    WHERE ur.cod_usuario = u.cod_usuario
      AND ur.cod_reto = (SELECT cod_reto FROM retos WHERE nombre_reto='Información de m3 por pieza desgaste')
      AND ur.fecha_objetivo='2025-08-21'
  );

-- Multi-día: Inventario de radios (18→23) ABANDONADO
INSERT INTO usuarios_retos (cod_usuario, cod_reto, ventana_inicio, ventana_fin, estado, empezado_en, terminado_en)
SELECT u.cod_usuario,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Inventario de radios'),
       '2025-08-18','2025-08-23','abandonado','2025-08-22 07:00:00','2025-08-22 07:20:00'
FROM usuarios u
WHERE u.nickname_usuario='Arenera'
  AND NOT EXISTS (
    SELECT 1 FROM usuarios_retos ur
    WHERE ur.cod_usuario = u.cod_usuario
      AND ur.cod_reto = (SELECT cod_reto FROM retos WHERE nombre_reto='Inventario de radios')
      AND ur.ventana_inicio='2025-08-18' AND ur.ventana_fin='2025-08-23'
  );

-- ================
-- Nicole (GruaMan)
-- ================
-- Multi-día: Inventario de radios (18→23) ASIGNADO (pendiente)
INSERT INTO usuarios_retos (cod_usuario, cod_reto, ventana_inicio, ventana_fin, estado)
SELECT u.cod_usuario,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Inventario de radios'),
       '2025-08-18','2025-08-23','asignado'
FROM usuarios u
WHERE u.nickname_usuario='CunningHare#1'
  AND NOT EXISTS (
    SELECT 1 FROM usuarios_retos ur
    WHERE ur.cod_usuario = u.cod_usuario
      AND ur.cod_reto = (SELECT cod_reto FROM retos WHERE nombre_reto='Inventario de radios')
      AND ur.ventana_inicio='2025-08-18' AND ur.ventana_fin='2025-08-23'
  );

-- Multi-día: Inventarios de repuestos usados por obra (20→27) EN_PROGRESO
INSERT INTO usuarios_retos (cod_usuario, cod_reto, ventana_inicio, ventana_fin, estado, empezado_en)
SELECT u.cod_usuario,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Inventarios de repuestos usados por obra'),
       '2025-08-20','2025-08-27','en_progreso','2025-08-22 14:00:00'
FROM usuarios u
WHERE u.nickname_usuario='CunningHare#1'
  AND NOT EXISTS (
    SELECT 1 FROM usuarios_retos ur
    WHERE ur.cod_usuario = u.cod_usuario
      AND ur.cod_reto = (SELECT cod_reto FROM retos WHERE nombre_reto='Inventarios de repuestos usados por obra')
      AND ur.ventana_inicio='2025-08-20' AND ur.ventana_fin='2025-08-27'
  );

-- ================
-- Ellen (GruaMan)
-- ================
-- Multi-día: Inventarios de repuestos usados por obra (16→20) VENCIDO
INSERT INTO usuarios_retos (cod_usuario, cod_reto, ventana_inicio, ventana_fin, estado, terminado_en)
SELECT u.cod_usuario,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Inventarios de repuestos usados por obra'),
       '2025-08-16','2025-08-20','vencido','2025-08-20 18:00:00'
FROM usuarios u
WHERE u.nickname_usuario='SharkNomi'
  AND NOT EXISTS (
    SELECT 1 FROM usuarios_retos ur
    WHERE ur.cod_usuario = u.cod_usuario
      AND ur.cod_reto = (SELECT cod_reto FROM retos WHERE nombre_reto='Inventarios de repuestos usados por obra')
      AND ur.ventana_inicio='2025-08-16' AND ur.ventana_fin='2025-08-20'
  );

-- Multi-día: Inventario de radios (18→23) ASIGNADO
INSERT INTO usuarios_retos (cod_usuario, cod_reto, ventana_inicio, ventana_fin, estado)
SELECT u.cod_usuario,
       (SELECT cod_reto FROM retos WHERE nombre_reto='Inventario de radios'),
       '2025-08-18','2025-08-23','asignado'
FROM usuarios u
WHERE u.nickname_usuario='SharkNomi'
  AND NOT EXISTS (
    SELECT 1 FROM usuarios_retos ur
    WHERE ur.cod_usuario = u.cod_usuario
      AND ur.cod_reto = (SELECT cod_reto FROM retos WHERE nombre_reto='Inventario de radios')
      AND ur.ventana_inicio='2025-08-18' AND ur.ventana_fin='2025-08-23'
  );