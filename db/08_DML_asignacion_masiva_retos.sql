USE bd_bomberapp;

SET @ini := DATE('2025-08-01');
SET @fin := DATE('2025-09-10');

-- Cierra por fecha_objetivo con 80/20 y tiempos el MISMO día de la fecha_objetivo
UPDATE usuarios_retos ur
JOIN (
  SELECT
    ur.cod_usuario,
    ur.cod_reto,
    ur.fecha_objetivo,

    -- 80% completado, 20% vencido (determinista)
    CASE
      WHEN (CRC32(CONCAT_WS('-', ur.cod_usuario, ur.cod_reto, ur.fecha_objetivo)) % 10) < 8
        THEN 'completado'
      ELSE 'vencido'
    END AS new_estado,

    -- Horas verosímiles el MISMO día (inicio en la mañana, fin más tarde)
    CASE
      WHEN (CRC32(CONCAT_WS('-', ur.cod_usuario, ur.cod_reto, ur.fecha_objetivo)) % 10) < 8
        THEN TIMESTAMP(ur.fecha_objetivo,
                       MAKETIME(8  + (ur.cod_usuario % 3),    /* 08..10 */
                                5  + (ur.cod_reto    % 25),   /* minutos variables */
                                0))
      ELSE NULL
    END AS new_empezado,

    CASE
      WHEN (CRC32(CONCAT_WS('-', ur.cod_usuario, ur.cod_reto, ur.fecha_objetivo)) % 10) < 8
        THEN TIMESTAMP(ur.fecha_objetivo,
                       MAKETIME(10 + (ur.cod_usuario % 4),    /* 10..13 */
                                10 + (ur.cod_reto    % 30),   /* minutos variables */
                                0))
      ELSE TIMESTAMP(ur.fecha_objetivo, '23:59:00')
    END AS new_terminado

  FROM usuarios_retos ur
  WHERE ur.fecha_objetivo IS NOT NULL
    AND ur.fecha_objetivo BETWEEN @ini AND @fin
) plan
  ON plan.cod_usuario    = ur.cod_usuario
 AND plan.cod_reto       = ur.cod_reto
 AND plan.fecha_objetivo = ur.fecha_objetivo

SET
  -- Estado: respeta si ya estaba completado; si no, aplica plan (80/20)
  ur.estado = CASE
                WHEN ur.estado = 'completado' THEN 'completado'
                ELSE plan.new_estado
              END,

  -- Empezado: si ya estaba completado, no tocamos; si se completa ahora, asignamos; si vence, NULL
  ur.empezado_en = CASE
                     WHEN ur.estado = 'completado' THEN ur.empezado_en
                     WHEN plan.new_estado = 'completado' THEN plan.new_empezado
                     ELSE NULL
                   END,

  -- Terminado: si ya estaba completado, no tocamos; si completa, hora lógica; si vence, 23:59 del objetivo
  ur.terminado_en = CASE
                      WHEN ur.estado = 'completado' THEN ur.terminado_en
                      WHEN plan.new_estado = 'completado' THEN plan.new_terminado
                      ELSE plan.new_terminado
                    END,

  -- Fecha de compleción: MISMO día del objetivo cuando completa; NULL si vence.
  ur.fecha_complecion = CASE
                          WHEN ur.estado = 'completado' THEN COALESCE(ur.fecha_complecion, ur.terminado_en)
                          WHEN plan.new_estado = 'completado' THEN plan.new_terminado
                          ELSE NULL
                        END

WHERE ur.fecha_objetivo IS NOT NULL
  AND ur.fecha_objetivo BETWEEN @ini AND @fin;
