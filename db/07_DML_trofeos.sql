INSERT INTO bd_bomberapp.trofeos
(nombre_trofeo, descripcion_trofeo, icono_trofeo, recompensa_trofeo, cod_usuario)
VALUES
-- 1) Jefe de equipo con menos paradas
('Jefe Zen: Cero Paradas',
 '¿Crees tener pulso de cirujano? Este trofeo es para quien lidera equipos con menos paradas registradas. Mantén a tu crew fluyendo y demuéstralo con números.',
 'jefe-zen.png',
 '400 monedas + 150 XP', NULL),

-- 2) Más tiempo en un equipo sin parar
('Maratón de Hierro',
 '¿Aguante infinito? Ganas si acumulas el mayor tiempo continuo en un equipo sin interrupciones. Constancia, café y acero en la mirada.',
 'maraton-de-hierro.png',
 '450 monedas + 150 XP', NULL),

-- 3) Mayor racha (ASIGNADO a usuario 3)
('Racha Imparable',
 '¿Puedes mantener la llama encendida día tras día? Este trofeo corona la racha más alta de actividad sin fallar.',
 'racha-imparable.png',
 '500 monedas + 200 XP', 3),

-- 4) Menos ausencias al trabajo
('El Inmortal de la Oficina',
 'Nunca falta, nunca se esconde. Tan presente que hasta la cafetera lo saluda por su nombre. Este trofeo lo porta aquel con menos inasistencias.',
 'el-inmortal-de-la-oficina.png',
 '350 monedas + 120 XP', NULL),

-- 5) Menos tiempo perdido (promedio más rápido en retos)
('Relámpago en la Cabeza',
 'Rápido pero preciso. Si resuelves retos con el menor tiempo promedio, este brillo es tuyo. ¿Cronómetro listo?',
 'relampago-en-la-cabeza.png',
 '500 monedas + 250 XP', NULL),

-- 6) Menos paros por equipo (grúas/bombas)
('Domador de Bestias',
 'Equipos dóciles, resultados salvajes. Te lo llevas si tus grúas/bombas reportan menos paros por equipo.',
 'domador-de-bestias.png',
 '400 monedas + 150 XP', NULL),

-- 7) Menos accidentes
('Escudo Invisible',
 'Seguridad que no se nota… porque todo sale bien. Premia al que menos incidentes/accidentes acumula.',
 'escudo-invisible.png',
 '450 monedas + 200 XP', NULL),

-- 8) Más información subida (más retos completados)
('Modo Upload: ON',
 '¿Eres la cinta transportadora de datos? Te lo llevas si eres quien más sube info al sistema (a.k.a. más retos completados).',
 '/icons/trophies/modo-upload-ON',
 '400 monedas + 180 XP', NULL);
