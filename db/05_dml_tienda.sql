USE bd_bomberapp;

INSERT INTO bd_bomberapp.items_tienda
  (nombre_item, descripcion_item, precio_item, tipo_item, icono_item)
VALUES
-- Potenciadores
('Protector de racha',
 'No te preocupes si un día no entras: este protector mantiene tu racha activa por un día completo.',
 40, 'potenciador', 'protector-de-racha.png'),

('Tiempo extra',
 'Añade +5s al límite de cada pregunta. Más aire, mejores respuestas.',
 20, 'potenciador', 'tiempo-extra.png'),

('x2',
 'Por reto, duplica la experiencia y las monedas obtenidas. Progreso que se siente.',
 75, 'potenciador', 'x2.png'),

('50/50',
 '¿Duda cruel? Elimina dos opciones y deja el acierto al alcance.',
 25, 'potenciador', '50-50.png'),

('Phoenix',
 'Recupera una pregunta fallada y conviértela en victoria. Segunda oportunidad, mejores resultados.',
 90, 'potenciador', 'ave-phoenix.png'),

-- Cofres
('Cofre pequeño',
 'Contiene 1 objeto al azar. Rápido, barato y perfecto para un empujón.',
 10, 'cofre', 'cofre-pequenno.svg'),

('Cofre medio',
 'Trae 5 objetos. Mejor selección y más chances de sacar algo que te potencie hoy.',
 100, 'cofre', 'cofre-medio.png'),

('Cofre grande',
 'Incluye 10 objetos cuidadosamente seleccionados. Aquí es donde salen las mejores recompensas.',
 1000, 'cofre', 'cofre-grande.png');

INSERT INTO bd_bomberapp.items_tienda
  (nombre_item, descripcion_item, precio_item, tipo_item, icono_item, slot_item)
VALUES
-- Ropa (cosméticos)
('Chaqueta CyberNeon Runner',
 'Chaqueta deportiva amarilla con secciones reflectantes. Te verás rápido hasta cuando trabajas lento.',
 250, 'ropa', 'chaqueta-cyberunner', 'torso'),

('Gafas de sol',
 'Protección elegante contra los rayos y con actitud futurista. Oscuras, ligeras y listas para cualquier partida.',
 120, 'ropa', 'gafas-de-sol.png', 'cabeza'),

('Casco pickelhaube',
 'Casco inspirado en el clásico prusiano, con un giro futurista que impone respeto y estilo en cualquier lobby.',
 180, 'ropa', 'casco-pickelhaube', 'cabeza'),
 
('Camiseta selaquimorfa', 'Una flipante camiseta selaquimorfa que recuerda a uno de los más famosos animales de la cultura popular.', 200, 'ropa', 'jaws', 'torso'),

('Falda rosadita', 'Una falda rosaditaaa que refleja estilo y personalidad.', 100, 'ropa', 'falda', 'piernas'),

('Pantalón cargo', 'Un ancho pantalón cargo gris oscuro a la moda, de lo más baggy y fresco actualmente.', 200, 'ropa', 'pantalon-cargo', 'piernas'),

('Zapatos Converce', 'Unos zapatos perfectos para romper el hielo y empezar cualquier conversación: ¿Dónde conseguiste esos zapatos tan buenos?.', 250, 'ropa', 'converce', 'pies');
