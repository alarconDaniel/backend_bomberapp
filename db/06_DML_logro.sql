USE bd_bomberapp;

-- 🎖️ Catálogo de logros base
INSERT INTO logros (nombre_logro, descripcion_logro, icono_logro, recompensa_logro)
VALUES
-- Progresión inicial
('Primer encendido', 'Completa tu primer reto.', '/static/icons/logros/primer-encendido.svg', '+50 XP'),
('Bandera al viento', 'Completa 5 retos en total.', '/static/icons/logros/bandera-al-viento.svg', '+200 XP'),
('Explorador', 'Completa retos de los 3 tipos distintos.', '/static/icons/logros/explorador.svg', '+120 XP'),

-- Rachas
('¡Racha 3!', 'Mantén una racha de 3 días seguidos.', '/static/icons/logros/racha-3.svg', '+30 monedas'),
('¡Racha 7!', 'Mantén una racha de 7 días seguidos.', '/static/icons/logros/racha-7.svg', '+100 monedas'),
('¡Racha 30!', 'Mantén una racha de 30 días seguidos.', '/static/icons/logros/racha-30.svg', '+400 monedas'),

-- Velocidad / precisión
('Velocista', 'Completa 3 retos en un mismo día.', '/static/icons/logros/velocista.svg', '+150 monedas'),
('Reloj de arena', 'Termina un reto en menos del 50% del tiempo estimado.', '/static/icons/logros/reloj-de-arena.svg', '+75 monedas'),
('Perfecto', 'Responde todas las preguntas de un quiz sin fallar.', '/static/icons/logros/perfecto.svg', '+180 XP'),

-- Economía
('Bolsillos sonando', 'Acumula 1000 monedas.', '/static/icons/logros/bolsillo-sonando.svg', '+150 XP'),
('Avaro feliz', 'Acumula 4000 monedas.', '/static/icons/logros/avaro-feliz.svg', '+350 XP'),
('Cofre abierto', 'Abre tu primer cofre grande.', '/static/icons/logros/cofre-abierto.svg', '+50 XP'),

-- Niveles
('Subiste de nivel I', 'Alcanza el nivel 5.', '/static/icons/logros/subiste-de-nivel-i.svg', '+100 monedas'),
('Subiste de nivel II', 'Alcanza el nivel 10.', '/static/icons/logros/subiste-de-nivel-ii.svg', '+200 monedas y +200 XP');

ALTER TABLE bd_bomberapp.usuarios_logros
  ADD UNIQUE KEY uk_usuario_logro (cod_usuario, cod_logro);


-- Dale 3 logros variados al usuario 
INSERT INTO usuarios_logros (cod_usuario, cod_logro)
SELECT 3, l.cod_logro
FROM logros l
WHERE l.nombre_logro IN ('Primer encendido', '¡Racha 30!', '¡Racha 7!', '¡Racha 3!', 'Cofre abierto');

-- Otro pack alternativo
INSERT INTO usuarios_logros (cod_usuario, cod_logro)
SELECT 2, l.cod_logro
FROM logros l
WHERE l.nombre_logro IN ('Velocista', 'Perfecto','Primer encendido');
