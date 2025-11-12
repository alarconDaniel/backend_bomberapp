USE bd_bomberapp;
/* Retos antiguos
-- Retos "normales"
INSERT INTO retos (nombre_reto, descripcion_reto, tiempo_estimado_seg_reto, fecha_inicio_reto, fecha_fin_reto, es_automatico_reto)
VALUES
('Check operacional de bombeo',
 'Entregar: Alerta automática al Líder Administrativo y Líder Operativo. Check de verificación, donde a través de la calificación Malo o Regular, llegue alerta con # de Bomba, Proyecto y repuesto a verificar o a cambiar a líder administrativa y líder operativo.',
 600000, '2025-08-15', '2025-08-22', 0),

('Inventarios de equipo y accesorios por obra (marcación tubería)',
 'Entregar: Informe en Excel (formato) y notificación a Líderes Administrativas. Cruzar con SAP en existencias por obra e incluir observaciones para acción.',
 1200000, '2025-08-15', '2025-08-22', 0),

('Inventarios de repuestos usados por obra',
 'Entregar: Listado en Excel por obra según formato. Listado con cantidades usadas, ubicación y observaciones para reposición.',
 900000, '2025-08-15', '2025-08-22', 0),

('Inventarios de mangueras con fotos',
 'Entregar: Foto(s) adjunta(s) + reporte en Excel/CSV. Foto de manguera con información de referencia, m3 trabajados, proveedor, y fecha de compra.',
 1800000, '2025-08-15', '2025-08-22', 0),

('Inventario de radios',
 'Entregar: Alerta por sistema y registro con evidencia. Check de verificación donde, a través de la calificación Malo o Regular, llegue alerta con # de Bomba, Proyecto y repuesto a verificar o a cambiar.',
 600000, '2025-08-15', '2025-08-22', 0),

('Kit mantenimientos bombas',
 'Entregar: Alerta por sistema y registro con evidencia. Check de verificación donde, a través de la calificación Malo o Regular, llegue alerta con # de Bomba, Proyecto y repuesto a verificar o a cambiar.',
 900000, '2025-08-15', '2025-08-22', 0),

('Información de m3 por pieza desgaste',
 'Entregar: Reporte/dashboard (PDF/Excel) con indicadores y lista. TD de repuestos de desgaste, indicadores hoy.',
 2700000, '2025-08-15', '2025-09-15', 0);
*/
-- Retos automáticos (plantillas) con flag = 1

USE bd_bomberapp;

-- GruaMan (cod: 2)

-- 1) Check list mantenimiento preventivo - Torre Grúa (tipo: form)
INSERT INTO retos (
  nombre_reto, descripcion_reto, tiempo_estimado_seg_reto,
  fecha_inicio_reto, fecha_fin_reto, es_automatico_reto,
  tipo_reto, metadata_reto, activo
)
VALUES (
  'Checklist MTTO preventivo - Torre Grúa',
  'Diligencia el mantenimiento preventivo de la torre grúa por grupos. En el encabezado rellena información general. En la columna "Seleccione" responde según el selector del ítem: B/M/R (Bueno/Malo/Regular) cuando aplique condición, Sí/No cuando sea verificación binaria, y registra mediciones en VOLTS u otras unidades cuando el ítem lo pida. Agrega observaciones cuando corresponda.',
  1800, '2025-01-01', '2099-12-31', 1, 'form',
  JSON_OBJECT(
    'kind','tg_checklist_v1',
    'schema', JSON_OBJECT(
      'header', JSON_OBJECT(
        'cliente', JSON_OBJECT('type','text','label','Cliente','required',true),
        'obra',    JSON_OBJECT('type','text','label','Obra','required',true),
        'ciudad',  JSON_OBJECT('type','text','label','Ciudad','required',true),
        'fecha',   JSON_OBJECT('type','date','label','Fecha','required',true),
        'tecnico', JSON_OBJECT('type','text','label','Técnico','required',true),
        'equipo',  JSON_OBJECT('type','text','label','Equipo','required',true),
        'serie',   JSON_OBJECT('type','text','label','Serie','required',true),
        'hora-inicio', JSON_OBJECT('type','text','label','Hora inicio','required',true),
        'hora-final',  JSON_OBJECT('type','text','label','Hora final','required',true),
        'numero-servicios', JSON_OBJECT('type','text','label','Número de servicios desde su ingreso a obra','required',true)
      ),
      'columns', JSON_ARRAY(
        JSON_OBJECT('key','n','label','Item'),
        JSON_OBJECT('key','valor','label','Seleccione','selectorType','auto'),
        JSON_OBJECT('key','observacion','label','Observación','type','textarea')
      ),
      'items', JSON_ARRAY(
        -- Base Grúa
        JSON_OBJECT('n',1,'grupo','Base Grúa','texto','Voltaje de  Alimentación Obra','selector','volts','required',true),
        JSON_OBJECT('n',2,'grupo','Base Grúa','texto','Voltaje salida  Autotransformador','selector','volts','required',true),
        JSON_OBJECT('n',3,'grupo','Base Grúa','texto','Estado de contactos y ajuste de  terminales','selector','brm','required',true),
        JSON_OBJECT('n',4,'grupo','Base Grúa','texto','Estado Cableado ( terminales hembras y machos )','selector','brm','required',true),
        JSON_OBJECT('n',5,'grupo','Base Grúa','texto','Estado caja Braker','selector','brm','required',true),
        JSON_OBJECT('n',6,'grupo','Base Grúa','texto','Polos A tierra Torre grúa','selector','brm','required',true),
        JSON_OBJECT('n',7,'grupo','Base Grúa','texto','Polos A tierra Transformador','selector','brm','required',true),
        JSON_OBJECT('n',8,'grupo','Base Grúa','texto','Contrapesos','selector','brm','required',true),
        JSON_OBJECT('n',9,'grupo','Base Grúa','texto','Soportes estructura','selector','brm','required',true),

        -- Ascenso estructura
        JSON_OBJECT('n',10,'grupo','Ascenso estructura','texto','Postura Pines y Pasadores','selector','sino','required',true),
        JSON_OBJECT('n',11,'grupo','Ascenso estructura','texto','Estado Estructura Mastil','selector','brm','required',true),
        JSON_OBJECT('n',12,'grupo','Ascenso estructura','texto','Estado estructura Secciones Telescopaje','selector','brm','required',true),
        JSON_OBJECT('n',13,'grupo','Ascenso estructura','texto','Ajustar  Letrero metalico','selector','sino','required',true),
        JSON_OBJECT('n',14,'grupo','Ascenso estructura','texto','Ajuste arriostrameinto,anillo,H','selector','brm','required',true),

        -- Cabina
        JSON_OBJECT('n',15,'grupo','Cabina','texto','Estado de aseo','selector','brm','required',true),
        JSON_OBJECT('n',16,'grupo','Cabina','texto','Ajuste Sillas / Estado Pisos','selector','brm','required',true),
        JSON_OBJECT('n',17,'grupo','Cabina','texto','Seguros puerta y ventana','selector','sino','required',true),
        JSON_OBJECT('n',18,'grupo','Cabina','texto','Barandas de Proteccion, pasadores y pines','selector','sino','required',true),
        JSON_OBJECT('n',19,'grupo','Cabina','texto','Mando Alambrico  / Inalambrico','selector','brm','required',true),

        -- Flecha
        JSON_OBJECT('n',20,'grupo','Flecha','texto','Estado estructura de flecha','selector','brm','required',true),
        JSON_OBJECT('n',21,'grupo','Flecha','texto','Postura Pines y Pasadores','selector','brm','required',true),
        JSON_OBJECT('n',22,'grupo','Flecha','texto','Punto Giratorio Cable Elevacion','selector','brm','required',true),
        JSON_OBJECT('n',23,'grupo','Flecha','texto','Limitadores','selector','brm','required',true),
        JSON_OBJECT('n',24,'grupo','Flecha','texto','Estado Poleas / Guaya  Distribucion','selector','brm','required',true),
        JSON_OBJECT('n',25,'grupo','Flecha','texto','Carro Estructura  / Patines / Poleas Elevacion','selector','brm','required',true),
        JSON_OBJECT('n',26,'grupo','Flecha','texto','Canasta /  Bandeja / llave  Carro','selector','brm','required',true),
        JSON_OBJECT('n',27,'grupo','Flecha','texto','Motor Distribucion  Conexcion  y Funcionamiento','selector','brm','required',true),
        JSON_OBJECT('n',28,'grupo','Flecha','texto','Ventilador Motor Distribucion','selector','brm','required',true),
        JSON_OBJECT('n',29,'grupo','Flecha','texto','Verificacion Ajuste Freno Distribucion','selector','brm','required',true),
        JSON_OBJECT('n',30,'grupo','Flecha','texto','Inspeccion Polea Dinamometrica','selector','brm','required',true),
        JSON_OBJECT('n',31,'grupo','Flecha','texto','Limitadores Dinamometricos','selector','brm','required',true),
        JSON_OBJECT('n',32,'grupo','Flecha','texto','Wincher / Reductor  Distribucion (Lubricacion )','selector','brm','required',true),
        JSON_OBJECT('n',33,'grupo','Flecha','texto','Limitador Distribucion','selector','brm','required',true),
        JSON_OBJECT('n',34,'grupo','Flecha','texto','Motor elevacion  Conexión y funcionamiento','selector','brm','required',true),
        JSON_OBJECT('n',35,'grupo','Flecha','texto','Ajuste y Calibracion Freno de Elevacion','selector','brm','required',true),
        JSON_OBJECT('n',36,'grupo','Flecha','texto','Wincher / Reductor  Elevacion (Lubricacion )','selector','brm','required',true),
        JSON_OBJECT('n',37,'grupo','Flecha','texto','Alineacion Wincher  / Poleas Inicio Flecha','selector','brm','required',true),
        JSON_OBJECT('n',38,'grupo','Flecha','texto','Limitador de Elevacion','selector','brm','required',true),

        -- Tablero Eléctrico
        JSON_OBJECT('n',39,'grupo','Tablero Electrico','texto','Estado General Cofre /  Chapas','selector','brm','required',true),
        JSON_OBJECT('n',40,'grupo','Tablero Electrico','texto','Barandas / Bandeja y Pines','selector','brm','required',true),
        JSON_OBJECT('n',41,'grupo','Tablero Electrico','texto','Estado General Contactores ( Funcionamiento , Desgaste )','selector','brm','required',true),
        JSON_OBJECT('n',42,'grupo','Tablero Electrico','texto','Estado y funcionamiento Tarjetas  / Serial  Tapones','selector','brm','required',true),
        JSON_OBJECT('n',43,'grupo','Tablero Electrico','texto','Alimentacion General','selector','volts','required',true),
        JSON_OBJECT('n',44,'grupo','Tablero Electrico','texto','Estado Cableado Tablero','selector','brm','required',true),
        JSON_OBJECT('n',45,'grupo','Tablero Electrico','texto','Estado Cableado Alimentacion Torre  Grúa','selector','brm','required',true),

        -- Corona
        JSON_OBJECT('n',46,'grupo','Corona','texto','Estado y funcionamiento Limitadores de Momento','selector','brm','required',true),
        JSON_OBJECT('n',47,'grupo','Corona','texto','Dentado Corona / Engrase Interno  y Externo','selector','brm','required',true),
        JSON_OBJECT('n',48,'grupo','Corona','texto','Motor de Giro Conexiones y Funcionamiento','selector','brm','required',true),
        JSON_OBJECT('n',50,'grupo','Corona','texto','Ventilador Motor de Giro','selector','brm','required',true),
        JSON_OBJECT('n',51,'grupo','Corona','texto','Limitador de Giro','selector','brm','required',true),
        JSON_OBJECT('n',52,'grupo','Corona','texto','Reductor de Giro ( Fugas y Lubricacion )','selector','brm','required',true),

        -- Contra Flecha
        JSON_OBJECT('n',53,'grupo','Contra Flecha','texto','Estructura, barandas y Pines','selector','brm','required',true),
        JSON_OBJECT('n',54,'grupo','Contra Flecha','texto','Contrapesas  Aereos','selector','brm','required',true),
        JSON_OBJECT('n',55,'grupo','Contra Flecha','texto','Ajuste Avisos','selector','sino','required',true),

        -- Accesorios
        JSON_OBJECT('n',56,'grupo','Accesorios','texto','Estado general  Gancho /  Pastecla / Poleas','selector','brm','required',true),
        JSON_OBJECT('n',57,'grupo','Accesorios','texto','Lengüeta / Pestillo seguro','selector','brm','required',true),
        JSON_OBJECT('n',58,'grupo','Accesorios','texto','Estado Baldes  /  Canasta','selector','brm','required',true),
        JSON_OBJECT('n',59,'grupo','Accesorios','texto','Elementos de Izaje','selector','brm','required',true)
      ),
      'validation', JSON_OBJECT('minItems', 3)
    ),
    'ui', JSON_OBJECT('allowDraft', true,'autoSave', true)
  ),
  1
);

-- 2) Check list mantenimiento preventivo - Elevador de Obra (tipo: form)
INSERT INTO retos (
  nombre_reto, descripcion_reto, tiempo_estimado_seg_reto,
  fecha_inicio_reto, fecha_fin_reto, es_automatico_reto,
  tipo_reto, metadata_reto, activo
)
VALUES (
  'Checklist MTTO preventivo - Elevador de Obra',
  'Diligencia el mantenimiento preventivo del elevador por grupos. En el encabezado rellena información general. Usa la columna "Seleccione" para responder B/M/R (Bueno/Malo/Regular) en los ítems de condición, Sí/No en verificaciones binarias y valores de medición (VOLTS/OHMS) cuando el ítem lo especifique. Complementa con observaciones de ser necesario.',
  1800, '2025-01-01', '2099-12-31', 1, 'form',
  JSON_OBJECT(
    'kind','elevador_checklist_v1',
    'schema', JSON_OBJECT(
      'header', JSON_OBJECT(
        'cliente', JSON_OBJECT('type','text','label','Cliente','required',true),
        'obra',    JSON_OBJECT('type','text','label','Obra','required',true),
        'ciudad',  JSON_OBJECT('type','text','label','Ciudad','required',true),
        'fecha',   JSON_OBJECT('type','date','label','Fecha','required',true),
        'tecnico', JSON_OBJECT('type','text','label','Técnico','required',true),
        'equipo',  JSON_OBJECT('type','text','label','Equipo','required',true),
        'serie',   JSON_OBJECT('type','text','label','Serie','required',true),
        'hora-inicio', JSON_OBJECT('type','text','label','Hora inicio','required',true),
        'hora-final',  JSON_OBJECT('type','text','label','Hora final','required',true),
		'numero-servicios', JSON_OBJECT('type','text','label','Número de servicios desde su ingreso a obra','required',true)
      ),
      'columns', JSON_ARRAY(
        JSON_OBJECT('key','n','label','Item'),
        JSON_OBJECT('key','valor','label','Seleccione','selectorType','auto'),
        JSON_OBJECT('key','observacion','label','Observación','type','textarea')
      ),
      'items', JSON_ARRAY(
        -- Base Elevador
        JSON_OBJECT('n',1,'grupo','Base Elevador','texto','Voltaje de  Alimentación Obra','selector','volts','required',true),
        JSON_OBJECT('n',2,'grupo','Base Elevador','texto','Voltaje salida  Autotransformador','selector','volts','required',true),
        JSON_OBJECT('n',3,'grupo','Base Elevador','texto','Estado de contactos y ajuste de  terminales','selector','brm','required',true),
        JSON_OBJECT('n',4,'grupo','Base Elevador','texto','Estado Cableado ( terminales hembras y machos )','selector','brm','required',true),
        JSON_OBJECT('n',5,'grupo','Base Elevador','texto','Estado caja Braker','selector','brm','required',true),
        JSON_OBJECT('n',6,'grupo','Base Elevador','texto','Polos A tierra Elevador Malacate','selector','brm','required',true),
        JSON_OBJECT('n',7,'grupo','Base Elevador','texto','Polos A tierra Transformador','selector','brm','required',true),
        JSON_OBJECT('n',8,'grupo','Base Elevador','texto','Contrapesos','selector','brm','required',true),
        JSON_OBJECT('n',9,'grupo','Base Elevador','texto','Soportes estructura','selector','brm','required',true),

        -- Cabina
        JSON_OBJECT('n',15,'grupo','Cabina','texto','Estado y  Aseo','selector','brm','required',true),
        JSON_OBJECT('n',16,'grupo','Cabina','texto','Ajuste  Piso','selector','brm','required',true),
        JSON_OBJECT('n',17,'grupo','Cabina','texto','Nivel antideslizante piso','selector','brm','required',true),
        JSON_OBJECT('n',18,'grupo','Cabina','texto','Barandas de Proteccion salida','selector','sino','required',true),
        JSON_OBJECT('n',19,'grupo','Cabina','texto','Puertas Cierre y Apertura  / Lubricacion y Ajuste','selector','brm','required',true),
        JSON_OBJECT('n',20,'grupo','Cabina','texto','Guayas  de las puertas','selector','brm','required',true),
        JSON_OBJECT('n',21,'grupo','Cabina','texto','Pernos de ajuste  Guayas','selector','brm','required',true),
        JSON_OBJECT('n',22,'grupo','Cabina','texto','Rodamientos  puertas','selector','brm','required',true),
        JSON_OBJECT('n',23,'grupo','Cabina','texto','Limitadores de Carga','selector','brm','required',true),
        JSON_OBJECT('n',24,'grupo','Cabina','texto','Limitadores de Peso','selector','brm','required',true),
        JSON_OBJECT('n',25,'grupo','Cabina','texto','Limitadores  Ascenso','selector','brm','required',true),
        JSON_OBJECT('n',26,'grupo','Cabina','texto','Limitadores   Descenso','selector','brm','required',true),

        -- Electrico
        JSON_OBJECT('n',27,'grupo','Electrico','texto','Voltaje de entrada Tablero','selector','volts','required',true),
        JSON_OBJECT('n',28,'grupo','Electrico','texto','Estado contactores Primarios','selector','brm','required',true),
        JSON_OBJECT('n',29,'grupo','Electrico','texto','Estado contactores  Secundarios','selector','brm','required',true),
        JSON_OBJECT('n',30,'grupo','Electrico','texto','Cable alimentacion Elevador','selector','brm','required',true),
        JSON_OBJECT('n',31,'grupo','Electrico','texto','Carrete  cable electrico','selector','brm','required',true),
        JSON_OBJECT('n',32,'grupo','Electrico','texto','Mando Cabina','selector','brm','required',true),

        -- Motores
        JSON_OBJECT('n',39,'grupo','Motores','texto','Estado del marco de los motores','selector','brm','required',true),
        JSON_OBJECT('n',40,'grupo','Motores','texto','Nivel de aceite de los motores','selector','brm','required',true),
        JSON_OBJECT('n',41,'grupo','Motores','texto','Estado del asbesto discos de freno','selector','brm','required',true),
        JSON_OBJECT('n',42,'grupo','Motores','texto','Ajuste de los frenos','selector','brm','required',true),
        JSON_OBJECT('n',43,'grupo','Motores','texto','Voltaje de ingreso a motores','selector','volts','required',true),
        JSON_OBJECT('n',44,'grupo','Motores','texto','Resistencia de los motores','selector','ohms','required',true),
        JSON_OBJECT('n',45,'grupo','Motores','texto','Rodamientos','selector','brm','required',true),
        JSON_OBJECT('n',46,'grupo','Motores','texto','Estado de  Piñones','selector','brm','required',true),
        JSON_OBJECT('n',47,'grupo','Motores','texto','Ajuste tornillos de sujecion motores','selector','brm','required',true),
        JSON_OBJECT('n',48,'grupo','Motores','texto','Ajuste de tornillos marco Motores','selector','brm','required',true)
      ),
      'validation', JSON_OBJECT('minItems', 3)
    ),
    'ui', JSON_OBJECT('allowDraft', true,'autoSave', true)
  ),
  1
);

-- 3) Acta de visita a obra (tipo: form)
INSERT INTO retos (
  nombre_reto, descripcion_reto, tiempo_estimado_seg_reto,
  fecha_inicio_reto, fecha_fin_reto, es_automatico_reto,
  tipo_reto, metadata_reto, activo
)
VALUES (
  'Acta de visita a obra',
  'Registra la visita a obra con encabezado, participantes (con firmas), temas tratados y plan de acción (acción, responsable y fecha). Se documenta la información en texto y se adjuntan archivos de aceptación cuando aplique.',
  1200, '2025-01-01', '2099-12-31', 1, 'form',
  JSON_OBJECT(
    'kind','acta_visita_v1',
    'schema', JSON_OBJECT(
      'encabezado', JSON_OBJECT(
        'fecha',        JSON_OBJECT('type','date','label','Fecha','required',true),
        'responsable',  JSON_OBJECT('type','text','label','Responsable de la visita','required',true),
        'consecutivo',  JSON_OBJECT('type','text','label','Consecutivo','required',true),
        'proceso',      JSON_OBJECT('type','text','label','Proceso encargado','required',true),
        'objetivo',     JSON_OBJECT('type','textarea','label','Objetivo de la reunión','required',true),
        'proyecto',     JSON_OBJECT('type','text','label','Proyecto y constructora','required',true)
      ),
      'participantes', JSON_OBJECT(
        'type','array','label','Participantes de la reunión',
        'item', JSON_OBJECT(
          'nombre', JSON_OBJECT('type','text','label','Nombres completos','required',true),
          'cargo',  JSON_OBJECT('type','text','label','Cargo','required',true),
          'firma',  JSON_OBJECT('type','file','label','Firma','accept',JSON_ARRAY('jpg','png'))
        ),
        'required', true
      ),
      'temas', JSON_OBJECT(
        'type','textarea','label','Temas a tratar durante la visita','required',true
      ),
      'plan_accion', JSON_OBJECT(
        'type','array','label','Planes de acción y mejoramiento continuo',
        'item', JSON_OBJECT(
          'accion', JSON_OBJECT('type','textarea','label','Acción','required',true),
          'responsable', JSON_OBJECT('type','text','label','Responsable','required',true),
          'fecha_ejecucion', JSON_OBJECT('type','date','label','Fecha de ejecución','required',true)
        )
      ),
      'aceptacion', JSON_OBJECT(
        'cliente', JSON_OBJECT('type','file','label','Aceptación del cliente (firma)','accept',JSON_ARRAY('jpg','png'), 'required',true),
        'ge',      JSON_OBJECT('type','file','label','Aceptación de Grúas & Equipos (firma)','accept',JSON_ARRAY('jpg','png'), 'required',true)
      )
    ),
    'ui', JSON_OBJECT('pdfLayoutHint','basado en PRE-FR-020 hoja 1')
  ),
  1
);

-- 4) PRE-FR-015 Alistamiento de equipos en patio (tipo: form)

USE bd_bomberapp;

-- 4) Alistamiento de equipos en patio
INSERT INTO retos (
  nombre_reto, descripcion_reto, tiempo_estimado_seg_reto,
  fecha_inicio_reto, fecha_fin_reto, es_automatico_reto,
  tipo_reto, metadata_reto, activo
)
VALUES (
  'Alistamiento de equipos en patio',
  'Antes de iniciar recuerda: TODAS LAS SECCIONES DEL BRAZO DEBEN IR CON LOS BULONES PUESTOS Y CON SUS PASADORES. \
En el encabezado diligencia la información general. \
La primera sección “ELEMENTOS DEL EQUIPO” se responde por ítem mostrando los campos debajo del título (referencia): \
Referencia (si aplica), Solicitud de Montaje (texto), Revisión (combo con: Revisión Tecnica / Medidas), Verificación (texto), Observación (texto opcional) y Nota (combo con: VERSION, FECHA DE EMISION, D___M___A___, Nota, Fecha, Fecha solicitud). \
Si eliges D___M___A___ debes ingresar la fecha en el campo que aparece. \
En las tablas de PRUEBAS, responde con: Inspeccionado (SI/NO), Medidas (combo: Revisión Técnica / Medidas) y Observaciones (texto). \
En las tablas de SOLICITUD DE REPUESTOS Y SUMINISTROS (# parte) también se muestran los campos en vertical bajo el título: Técnico solicita (texto), Cantidad (numérica) y Fecha solicitud (fecha).',
  1800, '2025-01-01', '2099-12-31', 1, 'form',
  JSON_OBJECT(
    'kind','alistamiento_equipos_patio_v1',
    'schema', JSON_OBJECT(

      /* ───── Encabezado ───── */
      'header', JSON_OBJECT(
        'cliente', JSON_OBJECT('type','text','label','Cliente','required',true),
        'nombre', JSON_OBJECT('type','text','label','Nombre','required',true),
        'obra',   JSON_OBJECT('type','text','label','Obra','required',true),
        'equipo', JSON_OBJECT('type','text','label','Equipo','required',true),
        'serie',  JSON_OBJECT('type','text','label','Serie','required',true),

        'fecha_montaje', JSON_OBJECT('type','date','label','Fecha de montaje','required',true),
        'altura_inicial_montaje', JSON_OBJECT('type','text','label','Altura inicial de montaje','required',true),
        'longitud_brazo', JSON_OBJECT('type','text','label','Longitud de brazo','required',true),
        'altura_final', JSON_OBJECT('type','text','label','Altura final','required',true),
        'horometro', JSON_OBJECT('type','text','label','Horometro','required',true),

        'fecha_inicial_alistamiento', JSON_OBJECT('type','date','label','Fecha inicial de alistamiento','required',true),
        'entrega_repuestos', JSON_OBJECT('type','date','label','Entrega de repuestos (fecha)','required',true),
        'fecha_despacho_obra', JSON_OBJECT('type','date','label','Fecha de despacho a obra','required',true)
      ),

      /* ───── Columnas por grupo ─────
         - ELEMENTOS DEL EQUIPO => layout vertical (stack)
         - PRUEBAS => columnas estándar con SI/NO, Medidas, Observaciones
         - SOLICITUDES => layout vertical (stack)  */
      'columnsByGroup', JSON_OBJECT(

        /* 1) ELEMENTOS DEL EQUIPO: layout en pila */
        'ELEMENTOS DEL EQUIPO', JSON_OBJECT(
          'layout','stack',
          'columns', JSON_ARRAY(
            JSON_OBJECT('key','ref',               'label','Ref.',                   'selectorType','text',  'required',true),
            JSON_OBJECT('key','solicitud',         'label','Solicitud de Montaje',   'selectorType','text',  'required',true),
            JSON_OBJECT('key','revision',          'label','Revisión',               'selectorType','combo', 'options', JSON_ARRAY('Revisión Tecnica','Medidas'), 'required',true),
            JSON_OBJECT('key','verificacion',      'label','Verificación',           'selectorType','text',  'required',true),
            JSON_OBJECT('key','observacion',       'label','Observación',            'selectorType','text',  'required',false),
            JSON_OBJECT('key','nota',              'label','Nota',                   'selectorType','combo', 'options',
              JSON_ARRAY('VERSION','FECHA DE EMISION','D___M___A___','Nota','Fecha','Fecha solicitud'), 'required',true),
            JSON_OBJECT('key','nota_fecha',        'label','Fecha (si Nota = D___M___A___)','selectorType','date', 'required',false)
          )
        ),

        /* 2) a 9) PRUEBAS: SI/NO + Medidas + Obs */
        'PRUEBA TABLERO ELÉCTRICO', JSON_ARRAY(
          JSON_OBJECT('key','inspeccionado','label','Inspeccionado','selectorType','sino','required',true),
          JSON_OBJECT('key','medidas','label','Medidas','selectorType','combo','options',JSON_ARRAY('Revisión Técnica','Medidas'),'required',true),
          JSON_OBJECT('key','observacion','label','Observaciones','selectorType','text')
        ),

        'PRUEBA MOTOR DE ELEVACIÓN', JSON_ARRAY(
          JSON_OBJECT('key','inspeccionado','label','Inspeccionado','selectorType','sino','required',true),
          JSON_OBJECT('key','medidas','label','Medidas','selectorType','combo','options',JSON_ARRAY('Revisión Técnica','Medidas'),'required',true),
          JSON_OBJECT('key','observacion','label','Observaciones','selectorType','text')
        ),

        'PRUEBA WINCHER DE ELEVACIÓN', JSON_ARRAY(
          JSON_OBJECT('key','inspeccionado','label','Inspeccionado','selectorType','sino','required',true),
          JSON_OBJECT('key','medidas','label','Medidas','selectorType','combo','options',JSON_ARRAY('Revisión Técnica','Medidas'),'required',true),
          JSON_OBJECT('key','observacion','label','Observaciones','selectorType','text')
        ),

        'PRUEBA MOTOR DE CARRO', JSON_ARRAY(
          JSON_OBJECT('key','inspeccionado','label','Inspeccionado','selectorType','sino','required',true),
          JSON_OBJECT('key','medidas','label','Medidas','selectorType','combo','options',JSON_ARRAY('Revisión Técnica','Medidas'),'required',true),
          JSON_OBJECT('key','observacion','label','Observaciones','selectorType','text')
        ),

        'PRUEBA MOTOR DE GIRO', JSON_ARRAY(
          JSON_OBJECT('key','inspeccionado','label','Inspeccionado','selectorType','sino','required',true),
          JSON_OBJECT('key','medidas','label','Medidas','selectorType','combo','options',JSON_ARRAY('Revisión Técnica','Medidas'),'required',true),
          JSON_OBJECT('key','observacion','label','Observaciones','selectorType','text')
        ),

        'PRUEBA ALINEACIÓN DE POLEA DINAMOMÉTRICA', JSON_ARRAY(
          JSON_OBJECT('key','inspeccionado','label','Inspeccionado','selectorType','sino','required',true),
          JSON_OBJECT('key','medidas','label','Medidas','selectorType','combo','options',JSON_ARRAY('Revisión Técnica','Medidas'),'required',true),
          JSON_OBJECT('key','observacion','label','Observaciones','selectorType','text')
        ),

        'PRUEBA Y VERIFICACIÓN DEL GANCHO', JSON_ARRAY(
          JSON_OBJECT('key','inspeccionado','label','Inspeccionado','selectorType','sino','required',true),
          JSON_OBJECT('key','medidas','label','Medidas','selectorType','combo','options',JSON_ARRAY('Revisión Técnica','Medidas'),'required',true),
          JSON_OBJECT('key','observacion','label','Observaciones','selectorType','text')
        ),

        'PRUEBAS Y VERIFICACIÓN DE BALDES', JSON_ARRAY(
          JSON_OBJECT('key','inspeccionado','label','Inspeccionado','selectorType','sino','required',true),
          JSON_OBJECT('key','medidas','label','Medidas','selectorType','combo','options',JSON_ARRAY('Revisión Técnica','Medidas'),'required',true),
          JSON_OBJECT('key','observacion','label','Observaciones','selectorType','text')
        ),

        /* 10) a 15) SOLICITUDES: layout en pila */
        'SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero', JSON_OBJECT(
          'layout','stack',
          'columns', JSON_ARRAY(
            JSON_OBJECT('key','tecnico','label','Técnico solicita','selectorType','text','required',true),
            JSON_OBJECT('key','cantidad','label','Cantidad','selectorType','qty','required',true),
            JSON_OBJECT('key','fecha','label','Fecha solicitud','selectorType','date','required',true)
          )
        ),
        'SOLICITUD DE REPUESTOS Y SUMINISTROS · Tarjetas', JSON_OBJECT(
          'layout','stack',
          'columns', JSON_ARRAY(
            JSON_OBJECT('key','tecnico','label','Técnico solicita','selectorType','text','required',true),
            JSON_OBJECT('key','cantidad','label','Cantidad','selectorType','qty','required',true),
            JSON_OBJECT('key','fecha','label','Fecha solicitud','selectorType','date','required',true)
          )
        ),
        'SOLICITUD DE REPUESTOS Y SUMINISTROS · Limitadores final de carrera', JSON_OBJECT(
          'layout','stack',
          'columns', JSON_ARRAY(
            JSON_OBJECT('key','tecnico','label','Técnico solicita','selectorType','text','required',true),
            JSON_OBJECT('key','cantidad','label','Cantidad','selectorType','qty','required',true),
            JSON_OBJECT('key','fecha','label','Fecha solicitud','selectorType','date','required',true)
          )
        ),
        'SOLICITUD DE REPUESTOS Y SUMINISTROS · Poleas', JSON_OBJECT(
          'layout','stack',
          'columns', JSON_ARRAY(
            JSON_OBJECT('key','tecnico','label','Técnico solicita','selectorType','text','required',true),
            JSON_OBJECT('key','cantidad','label','Cantidad','selectorType','qty','required',true),
            JSON_OBJECT('key','fecha','label','Fecha solicitud','selectorType','date','required',true)
          )
        ),
        'SOLICITUD DE REPUESTOS Y SUMINISTROS · Carro & Gancho', JSON_OBJECT(
          'layout','stack',
          'columns', JSON_ARRAY(
            JSON_OBJECT('key','tecnico','label','Técnico solicita','selectorType','text','required',true),
            JSON_OBJECT('key','cantidad','label','Cantidad','selectorType','qty','required',true),
            JSON_OBJECT('key','fecha','label','Fecha solicitud','selectorType','date','required',true)
          )
        )
      ),

      /* ───── Columnas de respaldo (no usadas si hay columnsByGroup) ───── */
      'columns', JSON_ARRAY(
        JSON_OBJECT('key','n','label','Item'),
        JSON_OBJECT('key','valor','label','Seleccione','selectorType','auto','required',true),
        JSON_OBJECT('key','observacion','label','Observación','type','textarea')
      ),

      /* ───── Ítems (todos required salvo que la instrucción diga observación opcional) ───── */
      'items', JSON_ARRAY(

        /* 1) ELEMENTOS DEL EQUIPO */
        JSON_OBJECT('n',1,'grupo','ELEMENTOS DEL EQUIPO','texto','PIES DE EMPOTRAMIENTO   Ref. ________','required',true),
        JSON_OBJECT('n',2,'grupo','ELEMENTOS DEL EQUIPO','texto','MARCO EMPOTRAMIENTO  Ref._________','required',true),
        JSON_OBJECT('n',3,'grupo','ELEMENTOS DEL EQUIPO','texto','CHASIS  Ref. __________________','required',true),
        JSON_OBJECT('n',4,'grupo','ELEMENTOS DEL EQUIPO','texto','PIEDRAS CHASIS 2500 KG','required',true),
        JSON_OBJECT('n',5,'grupo','ELEMENTOS DEL EQUIPO','texto','SECCION DE 3 MTS 1,6X1,6  L46','required',true),
        JSON_OBJECT('n',6,'grupo','ELEMENTOS DEL EQUIPO','texto','SECCION CONICA  S425','required',true),
        JSON_OBJECT('n',7,'grupo','ELEMENTOS DEL EQUIPO','texto','SECCION INICIO 10m  SR24E / S26E','required',true),
        JSON_OBJECT('n',8,'grupo','ELEMENTOS DEL EQUIPO','texto','SECCION DE ARRANQUE 7,5m  SR24J','required',true),
        JSON_OBJECT('n',9,'grupo','ELEMENTOS DEL EQUIPO','texto','SECCION DE 10m  S24E','required',true),
        JSON_OBJECT('n',10,'grupo','ELEMENTOS DEL EQUIPO','texto','SECCION DE 10m  S23E','required',true),
        JSON_OBJECT('n',11,'grupo','ELEMENTOS DEL EQUIPO','texto','SECCION DE 10m  S22E','required',true),
        JSON_OBJECT('n',12,'grupo','ELEMENTOS DEL EQUIPO','texto','SECCIONES DE 7,5m  S23F','required',true),
        JSON_OBJECT('n',13,'grupo','ELEMENTOS DEL EQUIPO','texto','SECCIONES DE 3m  S24C1','required',true),
        JSON_OBJECT('n',14,'grupo','ELEMENTOS DEL EQUIPO','texto','SECCION DE TELESCOPAJE TT DE 1,5m','required',true),
        JSON_OBJECT('n',15,'grupo','ELEMENTOS DEL EQUIPO','texto','BULONES Ø 50 mm','required',true),
        JSON_OBJECT('n',16,'grupo','ELEMENTOS DEL EQUIPO','texto','BULONES Ø 40 mm','required',true),
        JSON_OBJECT('n',17,'grupo','ELEMENTOS DEL EQUIPO','texto','AGUJAS SEGURIDAD BULONES','required',true),
        JSON_OBJECT('n',18,'grupo','ELEMENTOS DEL EQUIPO','texto','PINES','required',true),
        JSON_OBJECT('n',19,'grupo','ELEMENTOS DEL EQUIPO','texto','PICA CON SISTEMA DE GIRO','required',true),
        JSON_OBJECT('n',20,'grupo','ELEMENTOS DEL EQUIPO','texto','CONTRAFLECHA','required',true),
        JSON_OBJECT('n',21,'grupo','ELEMENTOS DEL EQUIPO','texto','BARANDAS DE LA CONTRAFLECHA','required',true),
        JSON_OBJECT('n',22,'grupo','ELEMENTOS DEL EQUIPO','texto','TIRANTES DE LA CONTRAFLECHA','required',true),
        JSON_OBJECT('n',23,'grupo','ELEMENTOS DEL EQUIPO','texto','BULONES TIRANTES CONTRAFLECHA','required',true),
        JSON_OBJECT('n',24,'grupo','ELEMENTOS DEL EQUIPO','texto','BULONES Ø 40 mm PARA PICA','required',true),
        JSON_OBJECT('n',25,'grupo','ELEMENTOS DEL EQUIPO','texto','PIEDRA DE 3400 KG','required',true),
        JSON_OBJECT('n',26,'grupo','ELEMENTOS DEL EQUIPO','texto','PIEDRA DE 2950 KG','required',true),
        JSON_OBJECT('n',27,'grupo','ELEMENTOS DEL EQUIPO','texto','PIEDRA DE 2250 KG','required',true),
        JSON_OBJECT('n',28,'grupo','ELEMENTOS DEL EQUIPO','texto','PIEDRA DE 1700 KG','required',true),
        JSON_OBJECT('n',29,'grupo','ELEMENTOS DEL EQUIPO','texto','PIEDRA DE 800 KG','required',true),
        JSON_OBJECT('n',30,'grupo','ELEMENTOS DEL EQUIPO','texto','CABINA CON CHASIS Y PASAMANOS','required',true),
        JSON_OBJECT('n',31,'grupo','ELEMENTOS DEL EQUIPO','texto','VIDRIOS Y EMPAQUES DE LA CABINA','required',true),
        JSON_OBJECT('n',32,'grupo','ELEMENTOS DEL EQUIPO','texto','GATO HIDRAULICO SOPORTE VIDRIO','required',true),
        JSON_OBJECT('n',33,'grupo','ELEMENTOS DEL EQUIPO','texto','ESTADO DE LA PINTURA DE LA CABINA','required',true),
        JSON_OBJECT('n',34,'grupo','ELEMENTOS DEL EQUIPO','texto','SILLA DE LA CABINA','required',true),
        JSON_OBJECT('n',35,'grupo','ELEMENTOS DEL EQUIPO','texto','PIE DE FLECHA DE 10 M CON SISTEMA DE ELEVACION Y MOTOR CARRITO','required',true),
        JSON_OBJECT('n',36,'grupo','ELEMENTOS DEL EQUIPO','texto','SECCIONES DE BRAZO DE 10 MTS','required',true),
        JSON_OBJECT('n',37,'grupo','ELEMENTOS DEL EQUIPO','texto','SECCIONES DE BRAZO DE 5 MTS','required',true),
        JSON_OBJECT('n',38,'grupo','ELEMENTOS DEL EQUIPO','texto','TIRANTES BRAZO','required',true),
        JSON_OBJECT('n',39,'grupo','ELEMENTOS DEL EQUIPO','texto','BULONES TIRANTES BRAZO','required',true),
        JSON_OBJECT('n',40,'grupo','ELEMENTOS DEL EQUIPO','texto','LINEAS DE VIDA HORIZONTAL','required',true),
        JSON_OBJECT('n',41,'grupo','ELEMENTOS DEL EQUIPO','texto','PUNTA TOPE DE BRAZO','required',true),
        JSON_OBJECT('n',42,'grupo','ELEMENTOS DEL EQUIPO','texto','BANDEJA MOTOR DE CARRO','required',true),
        JSON_OBJECT('n',43,'grupo','ELEMENTOS DEL EQUIPO','texto','BANDEJA CARRITO','required',true),
        JSON_OBJECT('n',44,'grupo','ELEMENTOS DEL EQUIPO','texto','RATA (PUNTO MUERTO)','required',true),
        JSON_OBJECT('n',45,'grupo','ELEMENTOS DEL EQUIPO','texto','MOTOR DE GIRO  Serie. ____________','required',true),
        JSON_OBJECT('n',46,'grupo','ELEMENTOS DEL EQUIPO','texto','MOTOR DE CARRO  Serie. ____________','required',true),
        JSON_OBJECT('n',47,'grupo','ELEMENTOS DEL EQUIPO','texto','MOTOR DE ELEVACION Serie. __________','required',true),
        JSON_OBJECT('n',48,'grupo','ELEMENTOS DEL EQUIPO','texto','REDUCTOR DE GIRO Serie. __________','required',true),
        JSON_OBJECT('n',49,'grupo','ELEMENTOS DEL EQUIPO','texto','DISCO DE FRENO MOTOR DE ELEVACION','required',true),
        JSON_OBJECT('n',50,'grupo','ELEMENTOS DEL EQUIPO','texto','DISCO DE FRENO MOTOR DE GIRO','required',true),
        JSON_OBJECT('n',51,'grupo','ELEMENTOS DEL EQUIPO','texto','DISCO DE FRENO MOTOR DE CARRO','required',true),
        JSON_OBJECT('n',52,'grupo','ELEMENTOS DEL EQUIPO','texto','BANDEJA MOTOR DE GIRO','required',true),
        JSON_OBJECT('n',53,'grupo','ELEMENTOS DEL EQUIPO','texto','BANDEJA MOTOR ELEVACION','required',true),
        JSON_OBJECT('n',54,'grupo','ELEMENTOS DEL EQUIPO','texto','TABLERO ELECTRICO','required',true),
        JSON_OBJECT('n',55,'grupo','ELEMENTOS DEL EQUIPO','texto','SELECTOR DE ENCENDIDO','required',true),
        JSON_OBJECT('n',56,'grupo','ELEMENTOS DEL EQUIPO','texto','AUTOTRANSFORMADOR DE ______ KWA','required',true),
        JSON_OBJECT('n',57,'grupo','ELEMENTOS DEL EQUIPO','texto','BALDES 0,40m3 / 0,50m3','required',true),
        JSON_OBJECT('n',58,'grupo','ELEMENTOS DEL EQUIPO','texto','CANASTA DE MATERIALES','required',true),
        JSON_OBJECT('n',59,'grupo','ELEMENTOS DEL EQUIPO','texto','LANZAS PARA LA CANASTA','required',true),
        JSON_OBJECT('n',60,'grupo','ELEMENTOS DEL EQUIPO','texto','CARRO Sencillo / Doble','required',true),
        JSON_OBJECT('n',61,'grupo','ELEMENTOS DEL EQUIPO','texto','LLAVE DE TENSION DE CABLE UBICADA EN EL CARRO','required',true),
        JSON_OBJECT('n',62,'grupo','ELEMENTOS DEL EQUIPO','texto','BUEN ESTADO DE LOS PATINES DEL CARRO','required',true),
        JSON_OBJECT('n',63,'grupo','ELEMENTOS DEL EQUIPO','texto','GANCHO CON LENGÜETA DE SEGURIDAD - MANDO ALAMBRICO / INALAMBRICO','required',true),
        JSON_OBJECT('n',64,'grupo','ELEMENTOS DEL EQUIPO','texto','BOTIQUIN','required',true),
        JSON_OBJECT('n',65,'grupo','ELEMENTOS DEL EQUIPO','texto','RADIOTELEFONOS __________ Unds','required',true),
        JSON_OBJECT('n',66,'grupo','ELEMENTOS DEL EQUIPO','texto','EXTINTOR','required',true),
        JSON_OBJECT('n',67,'grupo','ELEMENTOS DEL EQUIPO','texto','LUMINARIA __________ Unds','required',true),
        JSON_OBJECT('n',68,'grupo','ELEMENTOS DEL EQUIPO','texto','LINEAS DE VIDA VERTICAL','required',true),
        JSON_OBJECT('n',69,'grupo','ELEMENTOS DEL EQUIPO','texto','ESLINGA __________ metros','required',true),
        JSON_OBJECT('n',70,'grupo','ELEMENTOS DEL EQUIPO','texto','CABLE DE PODER __________ metros','required',true),
        JSON_OBJECT('n',71,'grupo','ELEMENTOS DEL EQUIPO','texto','CABLE DE VELETA __________ metros','required',true),
        JSON_OBJECT('n',72,'grupo','ELEMENTOS DEL EQUIPO','texto','CABLE DE ELEVACIÓN __________ metros','required',true),
        JSON_OBJECT('n',73,'grupo','ELEMENTOS DEL EQUIPO','texto','AVISO DE PUBLICIDAD HORIZONTAL','required',true),
        JSON_OBJECT('n',74,'grupo','ELEMENTOS DEL EQUIPO','texto','AVISO DE PUBLICIDAD VERTICAL','required',true),
        JSON_OBJECT('n',75,'grupo','ELEMENTOS DEL EQUIPO','texto','AVISO TABLA DE CARGA','required',true),
        JSON_OBJECT('n',76,'grupo','ELEMENTOS DEL EQUIPO','texto','CAMISA DE TELESCOPAJE CON BANDEJAS','required',true),
        JSON_OBJECT('n',77,'grupo','ELEMENTOS DEL EQUIPO','texto','CILINDRO HIDRAULICO','required',true),
        JSON_OBJECT('n',78,'grupo','ELEMENTOS DEL EQUIPO','texto','BOMBA HIDRAULICA','required',true),
        JSON_OBJECT('n',79,'grupo','ELEMENTOS DEL EQUIPO','texto','LANZA','required',true),
        JSON_OBJECT('n',80,'grupo','ELEMENTOS DEL EQUIPO','texto','YUGO','required',true),
        JSON_OBJECT('n',81,'grupo','ELEMENTOS DEL EQUIPO','texto','PERCHA O MONORRIEL','required',true),

        /* 2) PRUEBA TABLERO ELÉCTRICO */
        JSON_OBJECT('n',101,'grupo','PRUEBA TABLERO ELÉCTRICO','texto','VERIFICAR ESTADO Y VIDA UTIL DE LOS CONTACTORES','required',true),
        JSON_OBJECT('n',102,'grupo','PRUEBA TABLERO ELÉCTRICO','texto','VERIFICAR EL ESTADO DE LAS TARJETAS','required',true),
        JSON_OBJECT('n',103,'grupo','PRUEBA TABLERO ELÉCTRICO','texto','VERIFICAR LOS TAPONES CORRECTOS','required',true),
        JSON_OBJECT('n',104,'grupo','PRUEBA TABLERO ELÉCTRICO','texto','VERIFICAR PARADA DE EMERGENCIA','required',true),
        JSON_OBJECT('n',105,'grupo','PRUEBA TABLERO ELÉCTRICO','texto','VERIFICAR ESTADO DE LA ESTRUCTURA DEL GABINETE','required',true),
        JSON_OBJECT('n',106,'grupo','PRUEBA TABLERO ELÉCTRICO','texto','VERIFICAR EL ESTADO DEL PITO','required',true),

        /* 3) PRUEBA MOTOR DE ELEVACIÓN */
        JSON_OBJECT('n',201,'grupo','PRUEBA MOTOR DE ELEVACIÓN','texto','MEDIR VOLTAJES DE MOTOR ENTRE (MIN) (MAX)','required',true),
        JSON_OBJECT('n',202,'grupo','PRUEBA MOTOR DE ELEVACIÓN','texto','VERIFICAR ESTADO DEL ASBESTO DEL FRENO EN mm','required',true),
        JSON_OBJECT('n',203,'grupo','PRUEBA MOTOR DE ELEVACIÓN','texto','VERIFICAR LA GRADUACION DEL FRENO SEGÚN GALGA','required',true),
        JSON_OBJECT('n',204,'grupo','PRUEBA MOTOR DE ELEVACIÓN','texto','VERIFICAR ESTADO DE LOS RESORTES EN LA PRENSA','required',true),
        JSON_OBJECT('n',205,'grupo','PRUEBA MOTOR DE ELEVACIÓN','texto','VERIFICAR QUE EL ENTRE HIERRO NO ESTE RAYADO O CON FISURAS','required',true),
        JSON_OBJECT('n',206,'grupo','PRUEBA MOTOR DE ELEVACIÓN','texto','VERIFICAR EL  NIVEL DE VALBULINA','required',true),
        JSON_OBJECT('n',207,'grupo','PRUEBA MOTOR DE ELEVACIÓN','texto','VERIFICAR QUE NO TENGA FUGAS','required',true),

        /* 4) PRUEBA WINCHER DE ELEVACIÓN */
        JSON_OBJECT('n',301,'grupo','PRUEBA WINCHER DE ELEVACIÓN','texto','VERIFICAR EL ESTADO DEL CABLE','required',true),
        JSON_OBJECT('n',302,'grupo','PRUEBA WINCHER DE ELEVACIÓN','texto','VERIFICACION DE LA LUBRICACION DEL CABLE','required',true),
        JSON_OBJECT('n',303,'grupo','PRUEBA WINCHER DE ELEVACIÓN','texto','VERIFICACION DE LA ALINEACION DEL WINCHE EN mm.','required',true),
        JSON_OBJECT('n',304,'grupo','PRUEBA WINCHER DE ELEVACIÓN','texto','MEDIR LA CANTIDAD DEL CABLE CON RESPECTO A LA ALTURA DE MONTAJE','required',true),

        /* 5) PRUEBA MOTOR DE CARRO */
        JSON_OBJECT('n',401,'grupo','PRUEBA MOTOR DE CARRO','texto','MEDIR VOLTAJES DE MOTOR ENTRE (MIN) (MAX)','required',true),
        JSON_OBJECT('n',402,'grupo','PRUEBA MOTOR DE CARRO','texto','VERIFICAR ESTADO DEL ASBESTO DEL FRENO EN mm','required',true),
        JSON_OBJECT('n',403,'grupo','PRUEBA MOTOR DE CARRO','texto','VERIFICAR LA GRADUACION DEL FRENO SEGÚN GALGA','required',true),
        JSON_OBJECT('n',404,'grupo','PRUEBA MOTOR DE CARRO','texto','VERIFICAR ESTADO DE LOS RESORTES EN LA PRENSA','required',true),
        JSON_OBJECT('n',405,'grupo','PRUEBA MOTOR DE CARRO','texto','VERIFICAR QUE EL ENTRE HIERRO NO ESTE RAYADO O CON FISURAS','required',true),
        JSON_OBJECT('n',406,'grupo','PRUEBA MOTOR DE CARRO','texto','VERIFICAR EL NIVEL DE VALBULINA','required',true),
        JSON_OBJECT('n',407,'grupo','PRUEBA MOTOR DE CARRO','texto','VERIFICAR QUE NO TENGA FUGAS','required',true),

        /* 6) PRUEBA MOTOR DE GIRO */
        JSON_OBJECT('n',501,'grupo','PRUEBA MOTOR DE GIRO','texto','MEDIR VOLTAJES DE MOTOR ENTRE (MIN) (MAX)','required',true),
        JSON_OBJECT('n',502,'grupo','PRUEBA MOTOR DE GIRO','texto','VERIFICAR ESTADO DEL ASBESTO DEL FRENO EN mm','required',true),
        JSON_OBJECT('n',503,'grupo','PRUEBA MOTOR DE GIRO','texto','VERIFICAR LA GRADUACION DEL FRENO SEGÚN GALGA','required',true),
        JSON_OBJECT('n',504,'grupo','PRUEBA MOTOR DE GIRO','texto','VERIFICAR ESTADO DE LOS RESORTES EN LA PRENSA','required',true),
        JSON_OBJECT('n',505,'grupo','PRUEBA MOTOR DE GIRO','texto','VERIFICAR QUE EL ENTRE HIERRO NO ESTE RAYADO O CON FISURAS','required',true),
        JSON_OBJECT('n',506,'grupo','PRUEBA MOTOR DE GIRO','texto','VERIFICAR EL  NIVEL DE VALBULINA','required',true),
        JSON_OBJECT('n',507,'grupo','PRUEBA MOTOR DE GIRO','texto','VERIFICAR QUE NO TENGA FUGAS','required',true),

        /* 7) PRUEBA ALINEACIÓN DE POLEA DINAMOMÉTRICA */
        JSON_OBJECT('n',601,'grupo','PRUEBA ALINEACIÓN DE POLEA DINAMOMÉTRICA','texto','VERIFICAR EL RADIO INTERNO DE LA GARGANTA 10 mm','required',true),
        JSON_OBJECT('n',602,'grupo','PRUEBA ALINEACIÓN DE POLEA DINAMOMÉTRICA','texto','VERIFICAR QUE NO ESTE MARCADA LA GARGANTA INTERNAMENTE','required',true),
        JSON_OBJECT('n',603,'grupo','PRUEBA ALINEACIÓN DE POLEA DINAMOMÉTRICA','texto','VERIFICAR QUE EL RODAMIENTO ESTE LUBRICADO Y EN PERFECTO ESTADO','required',true),
        JSON_OBJECT('n',604,'grupo','PRUEBA ALINEACIÓN DE POLEA DINAMOMÉTRICA','texto','VERIFICAR EL ESTADO DEL SOPORTE DE LA POLEA DINAMOMETRICA, QUE NO ESTE TORSIDO O GOLPEADO','required',true),

        /* 8) PRUEBA Y VERIFICACIÓN DEL GANCHO */
        JSON_OBJECT('n',701,'grupo','PRUEBA Y VERIFICACIÓN DEL GANCHO','texto','VERIFICAR LA LENGÜETA QUE ESTE DERECHA Y SIN GLOPES','required',true),
        JSON_OBJECT('n',702,'grupo','PRUEBA Y VERIFICACIÓN DEL GANCHO','texto','VERIFICAR EL TORNILLO DEL GANCHO','required',true),
        JSON_OBJECT('n',703,'grupo','PRUEBA Y VERIFICACIÓN DEL GANCHO','texto','VERIFICAR EL RODAMIENTO DEL GANCHO','required',true),

        /* 9) PRUEBAS Y VERIFICACIÓN DE BALDES */
        JSON_OBJECT('n',801,'grupo','PRUEBAS Y VERIFICACIÓN DE BALDES','texto','VERIFICAR LOS CIERRES DE LAS COMPUERTAS','required',true),
        JSON_OBJECT('n',802,'grupo','PRUEBAS Y VERIFICACIÓN DE BALDES','texto','VERIFICAR EL SEGURO DEL BALDE','required',true),
        JSON_OBJECT('n',803,'grupo','PRUEBAS Y VERIFICACIÓN DE BALDES','texto','VERIFICAR LAS SOLDADURAS Y PINTURA DEL BALDE','required',true),

        /* 10) SOLICITUD · Tablero */
        JSON_OBJECT('n',901,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# P-27411-76 - CONTACTOR 32A3','required',true),
        JSON_OBJECT('n',902,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# X-27411-61 - CONTACTOR 18A3','required',true),
        JSON_OBJECT('n',903,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# V-63411-65 - CONTACTOR 12A3','required',true),
        JSON_OBJECT('n',904,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# L-27411-73 - CONTACTOR 40A4','required',true),
        JSON_OBJECT('n',905,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# C-27411-65 - CONTACTOR 40A3','required',true),
        JSON_OBJECT('n',906,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# G-63411-52 - CONTACTOR 25A3','required',true),
        JSON_OBJECT('n',907,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# U-27411-81 - CONTACTOR 12A4','required',true),
        JSON_OBJECT('n',908,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# R-27411-78 - CONTACTOR 32A3','required',true),
        JSON_OBJECT('n',909,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# G-11411-97 - AUXILIAR LADN203','required',true),
        JSON_OBJECT('n',910,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# F-04411-45 - AUXILIAR LADN223','required',true),
        JSON_OBJECT('n',911,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# G-04411-46 - AUXILIAR LADN403','required',true),
        JSON_OBJECT('n',912,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# F-28411-03 - TEMPORIZADOR','required',true),
        JSON_OBJECT('n',913,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# J-04411-48 - TEMPORIZADOR LADR23','required',true),
        JSON_OBJECT('n',914,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# A-62974-69 - TEMPORIZADOR LADR03','required',true),
        JSON_OBJECT('n',915,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# U-63411-41 - TEMPORIZADOR LADT03','required',true),
        JSON_OBJECT('n',916,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# C-33411-43 - BOBINA 48V','required',true),
        JSON_OBJECT('n',917,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# X-30406-90 - TRANSFORMADOR T100F','required',true),
        JSON_OBJECT('n',918,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# G-14406-11 - TRANSFORMADOR T100F','required',true),
        JSON_OBJECT('n',919,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# S-29424-52 - FILTRO DE ALIMENTACION','required',true),
        JSON_OBJECT('n',920,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# U-00424-07 - RESISTENCIA R800D','required',true),
        JSON_OBJECT('n',921,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# P-30424-53 - RESISTENCIA 1.5 OHM 350W','required',true),
        JSON_OBJECT('n',922,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# H-15406-39 - PUENTE RECTIFICADOR 500V','required',true),
        JSON_OBJECT('n',923,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# G-30406-29 - PUENTE RECTIFICADOR 25V','required',true),
        JSON_OBJECT('n',924,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# Z-61406-31 - BLOQUE CONTROL','required',true),
        JSON_OBJECT('n',925,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tablero','texto','# X-51413-72 - SENSOR INDUCTIVO','required',true),

        /* 11) SOLICITUD · Tarjetas */
        JSON_OBJECT('n',951,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tarjetas','texto','# B-70406-46 - TARJETA DE GIRO / BLOQUE RCV','required',true),
        JSON_OBJECT('n',952,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tarjetas','texto','# V-15406-05 - BLOQUE TARJETA DE GIRO','required',true),
        JSON_OBJECT('n',953,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tarjetas','texto','# X-15406-07 - BLOQUE TARJETA DE GIRO','required',true),
        JSON_OBJECT('n',954,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tarjetas','texto','# A-15406-78 - BLOQUE TARJETA DE GIRO','required',true),
        JSON_OBJECT('n',955,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tarjetas','texto','# C-70406-47 - TARJETA DE POTENCIA / BLOQUE VAC','required',true),
        JSON_OBJECT('n',956,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tarjetas','texto','# M-65406-13 - TAPON RESISTENCIA POTENCIA','required',true),
        JSON_OBJECT('n',957,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Tarjetas','texto','# M-15406-43','required',true),

        /* 12) SOLICITUD · Limitadores final de carrera */
        JSON_OBJECT('n',981,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Limitadores final de carrera','texto','# S-02713-24','required',true),
        JSON_OBJECT('n',982,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Limitadores final de carrera','texto','# E-49413-43','required',true),
        JSON_OBJECT('n',983,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Limitadores final de carrera','texto','# D-38393-24 - PIÑON LIMITADOR DE ELEVACION','required',true),
        JSON_OBJECT('n',984,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Limitadores final de carrera','texto','# K-15393-99 - PIÑON LIMITADOR DE GIRO','required',true),
        JSON_OBJECT('n',985,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Limitadores final de carrera','texto','# V-45393-45','required',true),
        JSON_OBJECT('n',986,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Limitadores final de carrera','texto','# H-30393-65 - PIÑON LIMITADOR DE CARRO','required',true),
        JSON_OBJECT('n',987,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Limitadores final de carrera','texto','# F-51413-79 - LIMITADOR DE ELEVACION COMPLETO','required',true),
        JSON_OBJECT('n',988,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Limitadores final de carrera','texto','# J-51974-33','required',true),
        JSON_OBJECT('n',989,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Limitadores final de carrera','texto','# J-18671-71','required',true),
        JSON_OBJECT('n',990,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Limitadores final de carrera','texto','# J-49413-74 - LIMITADOR DE CARRO COMPLETO','required',true),
        JSON_OBJECT('n',991,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Limitadores final de carrera','texto','# S-02413-78','required',true),
        JSON_OBJECT('n',992,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Limitadores final de carrera','texto','# E-55413-94','required',true),
        JSON_OBJECT('n',993,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Limitadores final de carrera','texto','# E-51413-79','required',true),

        /* 13) SOLICITUD · Poleas */
        JSON_OBJECT('n',1011,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Poleas','texto','# K-94662-34 - POLEA COMPLETA 315mm','required',true),
        JSON_OBJECT('n',1012,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Poleas','texto','# V-84662-96 - POLEA COMPLETA 304mm','required',true),
        JSON_OBJECT('n',1013,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Poleas','texto','# G-21386-15 - POLEA COMPLETA 315mm','required',true),
        JSON_OBJECT('n',1014,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Poleas','texto','# G-11398-17 - RODAMIENTO PARA POLEA 315','required',true),
        JSON_OBJECT('n',1015,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Poleas','texto','# X-18396-07 - RODAMIENTO PARA POLEA 204','required',true),
        JSON_OBJECT('n',1016,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Poleas','texto','# K-34109-55 - SOPORTE POLEA DINAMOMETRICA','required',true),
        JSON_OBJECT('n',1017,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Poleas','texto','# V-27413-43 - LIMITADOR','required',true),
        JSON_OBJECT('n',1018,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Poleas','texto','# T-10386-97 - POLEA COMPLETA 204mm','required',true),

        /* 14 & 15) SOLICITUD · Gancho + Carro (mismo grupo visual) */
        JSON_OBJECT('n',1051,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Carro & Gancho','texto','# 82007936 - GANCHO 5 TON','required',true),
        JSON_OBJECT('n',1052,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Carro & Gancho','texto','# Q-05383-98 - LENGÜETA PARA GANCHO 5 TON','required',true),
        JSON_OBJECT('n',1053,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Carro & Gancho','texto','# U-05399-20 - RODAMIENTO GANCHO 3,2 TON','required',true),
        JSON_OBJECT('n',1054,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Carro & Gancho','texto','# 82008410 - GANCHO 3,2 TON','required',true),
        JSON_OBJECT('n',1055,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Carro & Gancho','texto','# P-05383-97 - LENGÜETA PARA GANCHO 2.5 TON','required',true),
        JSON_OBJECT('n',1056,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Carro & Gancho','texto','# Z-01417-02 - PITO PARA TORRE GRUA','required',true),
        JSON_OBJECT('n',1057,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Carro & Gancho','texto','# 83404516 - PATIN METALICO PARA CARRITO LATERAL','required',true),
        JSON_OBJECT('n',1058,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Carro & Gancho','texto','# L-29110-05 - TAPON RESISTENCIA POTENCIA CARRO','required',true),
        JSON_OBJECT('n',1059,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Carro & Gancho','texto','# J-59111-92 - PATIN EN TEFLON PARA CARRITO SUPERIOR','required',true),
        JSON_OBJECT('n',1060,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Carro & Gancho','texto','# H-75109-33 - PATIN EN TEFLON PARA CARRITO LATERAL','required',true),
        JSON_OBJECT('n',1061,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Carro & Gancho','texto','# B-01414-05 - TOPE DE CAUCHO BRAZO','required',true),
        JSON_OBJECT('n',1062,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Carro & Gancho','texto','# H-28414-27 - TOPE DE CAUCHO','required',true),
        JSON_OBJECT('n',1063,'grupo','SOLICITUD DE REPUESTOS Y SUMINISTROS · Carro & Gancho','texto','# C-86662-87 - VENTILADOR MOTOR DE CARRO','required',true)
      ),

      'validation', JSON_OBJECT('minItems', 3)
    ),
    'ui', JSON_OBJECT('allowDraft', true, 'autoSave', true)
  ),
  1
);

-- BomberMan (cod: 1)

-- 5) LISTA DE CHEQUEO PARA BOMBA ESTACIONARIA DE CONCRETO (Bomba CIFA o Turbosol)
INSERT INTO retos (
  nombre_reto, descripcion_reto, tiempo_estimado_seg_reto,
  fecha_inicio_reto, fecha_fin_reto, es_automatico_reto,
  tipo_reto, metadata_reto, activo
)
VALUES (
  'Lista de chequeo bomba estacionaria de concreto',
  'Formato de inspección para bombas CIFA o Turbosol. Cada ítem debe contestarse con BUENO (B), MALO (M), REGULAR (R) o NO APLICA (NA) en la columna “Seleccione” y con ABIERTO (A) o CERRADO (C) en la columna “Estado”. Además registre observaciones si corresponde. OBSERVACIONES: No olvide cubrir el mando a distancia y el control del bombeo de agua cuando esté lavando.',
  2400, '2025-01-01', '2099-12-31', 1, 'form',
  JSON_OBJECT(
    'kind','checklist_bomba_estacionaria_v1',
    'schema', JSON_OBJECT(
      'header', JSON_OBJECT(
        'operario',        JSON_OBJECT('type','text','label','Operario','required',true,'auto','userName'),
        'obra',            JSON_OBJECT('type','text','label','Obra','required',true),
        'fecha_inicio',    JSON_OBJECT('type','date','label','Fecha de inicio','required',true,'auto','today'),
        'fecha_final',     JSON_OBJECT('type','date','label','Fecha de final','required',true,'auto','today'),
        'bomba_no',        JSON_OBJECT('type','text','label','Bomba No.','required',true),
        'horometro_motor', JSON_OBJECT('type','number','label','Horómetro motor','required',true)
      ),
      'columns', JSON_ARRAY(
        JSON_OBJECT('key','n','label','Item'),
        JSON_OBJECT('key','valor','label','Seleccione','selectorType','auto'),
        JSON_OBJECT('key','estado','label','Estado','selectorType','ac'),
        JSON_OBJECT('key','observacion','label','Observación','type','textarea')
      ),
      'items', JSON_ARRAY(
        -- CHASIS
        JSON_OBJECT('n',1,'grupo','Chasis','texto','Revisar el nivel de aceite del motor.','selector', 'brmna','estado',true,'required',true),
        JSON_OBJECT('n',2,'grupo','Chasis','texto','Revise el nivel del tanque de combustible.','selector', 'brmna','estado',true,'required',true),
        JSON_OBJECT('n',3,'grupo','Chasis','texto','Revise el nivel del refrigerante.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',4,'grupo','Chasis','texto','Revise el nivel del aceite de la hidrolavadora.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',5,'grupo','Chasis','texto','Revise la condición y la presión de las llantas.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',6,'grupo','Chasis','texto','Revise fugas de combustible, aceite y otras fugas.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',7,'grupo','Chasis','texto','Revise el sub-chasis para detectar grietas, soldadura, pernos faltantes, deformaciones.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',8,'grupo','Chasis','texto','Revise la integridad estructural de la cubierta.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',9,'grupo','Chasis','texto','Revise que las cajas de herramientas y productos diversos estén aseguradas.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',10,'grupo','Chasis','texto','Revise sistema de drenaje de la alberca.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',11,'grupo','Chasis','texto','Revisión del filtro hidráulico del equipo.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',12,'grupo','Chasis','texto','Revisión del filtro del agua debe encontrarse limpio.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',13,'grupo','Chasis','texto','Revisar que el nivel del agua esté lleno.','selector','brmna','estado',true,'required',true),

        -- PIEZAS DE DESGASTE Y SALIENTES
        JSON_OBJECT('n',14,'grupo','Piezas de desgaste y salientes','texto','Revise anillo de corte y anillo de sujeción.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',15,'grupo','Piezas de desgaste y salientes','texto','Revise que el anillo de corte no presente desgaste prematuro.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',16,'grupo','Piezas de desgaste y salientes','texto','Revise placa gafa.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',17,'grupo','Piezas de desgaste y salientes','texto','Revise cilindros de empuje/camisas de concreto estén asegurados y bien atornillados.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',18,'grupo','Piezas de desgaste y salientes','texto','Revise pistones y asegure que no exista paso de masilla hacia la caja de refrigeración.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',19,'grupo','Piezas de desgaste y salientes','texto','Revise pistones y asegure que no exista paso de agua a la tolva.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',20,'grupo','Piezas de desgaste y salientes','texto','Revise condición de mangueras y tubos hidráulicos.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',21,'grupo','Piezas de desgaste y salientes','texto','Revise partes faltantes tales como pasadores, pernos y tuercas.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',22,'grupo','Piezas de desgaste y salientes','texto','Revise que la caja de agua sea estructuralmente rígida, esté limpia y con el drenaje funcional.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',23,'grupo','Piezas de desgaste y salientes','texto','Revise que el mecanismo de cambio del tubo en “S” sea estructuralmente rígido.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',24,'grupo','Piezas de desgaste y salientes','texto','Revise que la rejilla de la tolva no esté partida y que funcione el sensor.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',25,'grupo','Piezas de desgaste y salientes','texto','Revise estado del o-ring de la escotilla.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',26,'grupo','Piezas de desgaste y salientes','texto','Revise que el vibrador esté montado y cables asegurados y funcionando.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',27,'grupo','Piezas de desgaste y salientes','texto','Revise paletas y eje del agitador sin daños ni soldaduras agrietadas.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',28,'grupo','Piezas de desgaste y salientes','texto','Revise motor de accionamiento asegurado y componentes en buen estado.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',29,'grupo','Piezas de desgaste y salientes','texto','Revise válvula de control montada en forma segura y palancas libres.','selector','brmna','estado',true,'required',true),

        -- SISTEMA HIDRÁULICO
        JSON_OBJECT('n',30,'grupo','Sistema hidráulico','texto','Revise que no existan fugas hidráulicas; estrangule la máquina antes de iniciar servicio.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',31,'grupo','Sistema hidráulico','texto','Revise cilindros hidráulicos/botellas impulsoras aseguradas y en buen estado.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',32,'grupo','Sistema hidráulico','texto','Revise indicador visible de nivel aceite hidráulico en buenas condiciones.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',33,'grupo','Sistema hidráulico','texto','Revise enfriador de aceite hidráulico y su termostato.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',34,'grupo','Sistema hidráulico','texto','Revise indicadores de condición del filtro hidráulico.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',35,'grupo','Sistema hidráulico','texto','Revise que filtro hidráulico no tenga limalla.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',36,'grupo','Sistema hidráulico','texto','Revise mangueras y tubos asegurados, sin fugas y mínimo desgaste.','selector','brmna','estado',true,'required',true),

        -- SISTEMA DE LUBRICACIÓN
        JSON_OBJECT('n',37,'grupo','Sistema de lubricación','texto','Revise nivel del depósito de grasa.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',38,'grupo','Sistema de lubricación','texto','Revise puntos de lubricación (yugos, check, mangueras, tarro de autoengrase, etc).','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',39,'grupo','Sistema de lubricación','texto','Revise empaquetaduras conexión tubo en “S” lubricadas.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',40,'grupo','Sistema de lubricación','texto','Revise nivel de agua de caja de lubricación de pistones.','selector','brmna','estado',true,'required',true),

        -- MANGUERAS
        JSON_OBJECT('n',41,'grupo','Mangueras','texto','Revise internamente que la manguera no esté deshilachada.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',42,'grupo','Mangueras','texto','Revise acoples en buen estado.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',43,'grupo','Mangueras','texto','Revise externamente que la manguera no esté deshilachada.','selector','brmna','estado',true,'required',true),

        -- SISTEMA ELÉCTRICO
        JSON_OBJECT('n',44,'grupo','Sistema eléctrico','texto','Revise interruptores en buen estado.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',45,'grupo','Sistema eléctrico','texto','Revise instrumentos e indicadores en buen estado y luces funcionando.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',46,'grupo','Sistema eléctrico','texto','Revise cubiertas de caucho de protección en buenas condiciones.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',47,'grupo','Sistema eléctrico','texto','Revise cordón de mando en buen estado, sin daño ni cortes y bien conectado.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',48,'grupo','Sistema eléctrico','texto','Revise interruptores de emergencia funcionando correctamente.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',49,'grupo','Sistema eléctrico','texto','Revise conexiones eléctricas aseguradas y sin óxido.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',50,'grupo','Sistema eléctrico','texto','Revise paros de emergencia.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',51,'grupo','Sistema eléctrico','texto','Revise aisladores de cables no desgastados ni descascarados.','selector','brmna','estado',true,'required',true),

        -- TUBERÍA
        JSON_OBJECT('n',52,'grupo','Tubería','texto','Revise codo de salida asegurado y abrazadera fija.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',53,'grupo','Tubería','texto','Revise colocación de tubería y tallo bien anclada.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',54,'grupo','Tubería','texto','Revise abrazaderas de descarga sin daños.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',55,'grupo','Tubería','texto','Revise espesores de tubería.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',56,'grupo','Tubería','texto','Revise que la vertical o tallo se encuentre recta.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',57,'grupo','Tubería','texto','Revise área de desplazamiento segura para maniobra y descargue.','selector','brmna','estado',true,'required',true),

        -- SEGURIDAD Y SALUD EN EL TRABAJO (SST)
        JSON_OBJECT('n',58,'grupo','Seguridad y salud en el trabajo','texto','Revise que el equipo esté limpio, sin excesos de grasa ni concreto en vibrador, parrilla, tolva, tuberías, mangueras.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',59,'grupo','Seguridad y salud en el trabajo','texto','Revise orden y aseo.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',60,'grupo','Seguridad y salud en el trabajo','texto','Revise delimitación de área y etiquetado de productos.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',61,'grupo','Seguridad y salud en el trabajo','texto','Revise permisos de trabajo y ATS firmados según periodicidad.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',62,'grupo','Seguridad y salud en el trabajo','texto','Revise fecha de vencimiento de extintores.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',63,'grupo','Seguridad y salud en el trabajo','texto','Revise elementos del botiquín (stock y fechas de vencimiento).','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',64,'grupo','Seguridad y salud en el trabajo','texto','Revise vigencia de certificación de arnés y eslinga.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',65,'grupo','Seguridad y salud en el trabajo','texto','Revise formato de revisión de equipos de protección contra caídas.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',66,'grupo','Seguridad y salud en el trabajo','texto','Revise estado de dotación (camisa, pantalón, botas).','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',67,'grupo','Seguridad y salud en el trabajo','texto','Revise estado de EPP (casco, gafas, tapaoídos, tapabocas, barbuquejo, guantes).','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',68,'grupo','Seguridad y salud en el trabajo','texto','Revise rotulación obligatoria (ACPM, grasa litio, agua no potable).','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',69,'grupo','Seguridad y salud en el trabajo','texto','Revise matriz de compatibilidad ACPM/Grasa.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',70,'grupo','Seguridad y salud en el trabajo','texto','Revise demarcación del área de la bomba.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',71,'grupo','Seguridad y salud en el trabajo','texto','Revise orden y aseo (bomba y alrededores libres de concreto).','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',72,'grupo','Seguridad y salud en el trabajo','texto','Revise que operario y ayudante porten dotación completa.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',73,'grupo','Seguridad y salud en el trabajo','texto','Revise kit de mantenimiento y herramientas.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',74,'grupo','Seguridad y salud en el trabajo','texto','Revise stock de combustible y repuestos.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',75,'grupo','Seguridad y salud en el trabajo','texto','Revise horas de motor para mantenimiento.','selector','brmna','estado',true,'required',true),
        JSON_OBJECT('n',76,'grupo','Seguridad y salud en el trabajo','texto','Revise nivel de grasa y planillas de horas trabajadas y m³ bombeados.','selector','brmna','estado',true,'required',true)
      )
    ),
    'ui', JSON_OBJECT('pdfLayoutHint','basado en formato de bomba estacionaria')
  ),
  1
);


-- 6) Relación de entrega bomba de concreto y accesorios
INSERT INTO retos (
  nombre_reto, descripcion_reto, tiempo_estimado_seg_reto,
  fecha_inicio_reto, fecha_fin_reto, es_automatico_reto,
  tipo_reto, metadata_reto, activo
)
VALUES (
  'Relación de entrega bomba de concreto y accesorios',
  'Antes de diligenciar las tablas de accesorios, tenga en cuenta la siguiente nota: Los accesorios descritos corresponden a los que llegan de fabrica con el equipo. Se debe contestar con la cantidad de accesorios en la primera sección y luego contestar la cantidad respectiva de buenos y malos, con observaciones donde corresponda',
  1800, '2025-01-01', '2099-12-31', 1, 'form',
  JSON_OBJECT(
    'kind','relacion_entrega_bomba_v1',
    'schema', JSON_OBJECT(
      'header', JSON_OBJECT(
        'numero_bomba', JSON_OBJECT('type','text','label','Número de bomba','required',true),
        'cliente',      JSON_OBJECT('type','text','label','Cliente','required',true),
        'fecha',        JSON_OBJECT('type','date','label','Fecha'), -- NO requerida
        'obra',         JSON_OBJECT('type','text','label','Obra','required',true),
        'contacto',     JSON_OBJECT('type','text','label','Contacto','required',true),
        'direccion',    JSON_OBJECT('type','text','label','Dirección','required',true),
        'item',         JSON_OBJECT('type','text','label','Item','required',true),
        'telefono',     JSON_OBJECT('type','text','label','Telefono','required',true),
        'descripcion',  JSON_OBJECT('type','textarea','label','Descripcion','required',true),
        'modelo',       JSON_OBJECT('type','text','label','Modelo','required',true),
        'serie',        JSON_OBJECT('type','text','label','Serie','required',true)
      ),

      /* Columnas por grupo (para que cada sección tenga su propia tabla) */
      'columnsByGroup', JSON_OBJECT(
        'Descripción de accesorios del equipo',
          JSON_ARRAY(
            JSON_OBJECT('key','n','label','#'),
            JSON_OBJECT('key','valor','label','CANT','selectorType','qty','required',true)
          ),
        'Descripción de accesorios de tuberia',
          JSON_ARRAY(
            JSON_OBJECT('key','n','label','#'),
            JSON_OBJECT('key','valor','label','CANT','selectorType','qty','required',true)
          ),
        'Accesorios tuberia a mayor detalle',
          JSON_ARRAY(
            JSON_OBJECT('key','n','label','#'),
            JSON_OBJECT('key','buenas','label','BUENAS','selectorType','qty','required',true),
            JSON_OBJECT('key','malas','label','MALAS','selectorType','qty','required',true),
            JSON_OBJECT('key','observacion','label','OBSERVACIONES','type','textarea')
          )
      ),

      /* Columnas globales de respaldo (no se usan si existen columnsByGroup) */
      'columns', JSON_ARRAY(
        JSON_OBJECT('key','n','label','Item'),
        JSON_OBJECT('key','valor','label','Seleccione','selectorType','qty','required',true),
        JSON_OBJECT('key','observacion','label','Observación','type','textarea')
      ),

      /* Ítems (todas las filas marcadas como required:true) */
      'items', JSON_ARRAY(

        /* ───────────── 1) Descripción de accesorios del equipo ───────────── */
        JSON_OBJECT('n',1,'grupo','Descripción de accesorios del equipo','texto','BOLA DE LIMPIEZA PARA TUBERIA DE 5.5" CIFA','required',true),
        JSON_OBJECT('n',2,'grupo','Descripción de accesorios del equipo','texto','JOSTICK','required',true),
        JSON_OBJECT('n',3,'grupo','Descripción de accesorios del equipo','texto','INYECTOR DE GRASA','required',true),
        JSON_OBJECT('n',4,'grupo','Descripción de accesorios del equipo','texto','CAJA CON HERRAMIENTAS','required',true),
        JSON_OBJECT('n',5,'grupo','Descripción de accesorios del equipo','texto','TUBO ENTREGA 50CM FLANCHE PLANO','required',true),
        JSON_OBJECT('n',6,'grupo','Descripción de accesorios del equipo','texto','CANECA DE 5 GALONES','required',true),
        JSON_OBJECT('n',7,'grupo','Descripción de accesorios del equipo','texto','CANECA DE 55 GALONES','required',true),
        JSON_OBJECT('n',8,'grupo','Descripción de accesorios del equipo','texto','PIMPINAS DE 5 O 6 GALONES','required',true),
        JSON_OBJECT('n',9,'grupo','Descripción de accesorios del equipo','texto','MANGUERA BICOLOR','required',true),
        JSON_OBJECT('n',10,'grupo','Descripción de accesorios del equipo','texto','JUEGO DE LLAVES X3 PIEZAS','required',true),
        JSON_OBJECT('n',11,'grupo','Descripción de accesorios del equipo','texto','PINZA PICOLORO','required',true),
        JSON_OBJECT('n',12,'grupo','Descripción de accesorios del equipo','texto','BRISTOL 14MM','required',true),
        JSON_OBJECT('n',13,'grupo','Descripción de accesorios del equipo','texto','BRISTOL 12MM','required',true),
        JSON_OBJECT('n',14,'grupo','Descripción de accesorios del equipo','texto','JUEGO DE LLAVES BRISTOL X 9 PIEZAS','required',true),
        JSON_OBJECT('n',15,'grupo','Descripción de accesorios del equipo','texto','ALICATE','required',true),
        JSON_OBJECT('n',16,'grupo','Descripción de accesorios del equipo','texto','CORTAFRIO','required',true),
        JSON_OBJECT('n',17,'grupo','Descripción de accesorios del equipo','texto','PINZAS DE PUNTA','required',true),
        JSON_OBJECT('n',18,'grupo','Descripción de accesorios del equipo','texto','LLAVE EXPANSIVA 15"','required',true),
        JSON_OBJECT('n',19,'grupo','Descripción de accesorios del equipo','texto','MASETA','required',true),
        JSON_OBJECT('n',20,'grupo','Descripción de accesorios del equipo','texto','TUBO PARA ABRAZADERA','required',true),

        /* ───────────── 2) Descripción de accesorios de tuberia ───────────── */
        JSON_OBJECT('n',21,'grupo','Descripción de accesorios de tuberia','texto','LLAVE 11"','required',true),
        JSON_OBJECT('n',22,'grupo','Descripción de accesorios de tuberia','texto','LLAVE 10"','required',true),
        JSON_OBJECT('n',23,'grupo','Descripción de accesorios de tuberia','texto','LLAVE 13"','required',true),
        JSON_OBJECT('n',24,'grupo','Descripción de accesorios de tuberia','texto','LLAVE 14"','required',true),
        JSON_OBJECT('n',25,'grupo','Descripción de accesorios de tuberia','texto','LLAVE 17"','required',true),
        JSON_OBJECT('n',26,'grupo','Descripción de accesorios de tuberia','texto','LLAVE 19"','required',true),
        JSON_OBJECT('n',27,'grupo','Descripción de accesorios de tuberia','texto','LLAVE 22"','required',true),
        JSON_OBJECT('n',28,'grupo','Descripción de accesorios de tuberia','texto','LLAVE 24"','required',true),
        JSON_OBJECT('n',29,'grupo','Descripción de accesorios de tuberia','texto','LLAVE 27"','required',true),
        JSON_OBJECT('n',30,'grupo','Descripción de accesorios de tuberia','texto','LLAVE 30"','required',true),
        JSON_OBJECT('n',31,'grupo','Descripción de accesorios de tuberia','texto','LLAVE 32"','required',true),
        JSON_OBJECT('n',32,'grupo','Descripción de accesorios de tuberia','texto','DESTORNILLADOR DE PALA 6,5X125MM','required',true),
        JSON_OBJECT('n',33,'grupo','Descripción de accesorios de tuberia','texto','DESTORNILLADOR DE PALA 8X150MM','required',true),
        JSON_OBJECT('n',34,'grupo','Descripción de accesorios de tuberia','texto','DESTORNILLADOR DE PALA 5,5X125MM','required',true),
        JSON_OBJECT('n',35,'grupo','Descripción de accesorios de tuberia','texto','DESTORNILLADOR DE ESTRELLA PH3X1500MM','required',true),
        JSON_OBJECT('n',36,'grupo','Descripción de accesorios de tuberia','texto','DESTORNILLADOR DE ESTRELLA PH2X100MM','required',true),
        JSON_OBJECT('n',37,'grupo','Descripción de accesorios de tuberia','texto','DESTORNILLADOR DE ESTRELLA PH3X75MM','required',true),
        JSON_OBJECT('n',38,'grupo','Descripción de accesorios de tuberia','texto','CUÑETE DE GRASA 5 GALONES','required',true),
        JSON_OBJECT('n',39,'grupo','Descripción de accesorios de tuberia','texto','Vacio','required',true),
        JSON_OBJECT('n',40,'grupo','Descripción de accesorios de tuberia','texto','Vacio','required',true),

        /* ───────────── 3) Accesorios tuberia a mayor detalle ───────────── */
        JSON_OBJECT('n',41,'grupo','Accesorios tuberia a mayor detalle','texto','BOMBA DE CONCRETO PC506/309 CIFA','codigo','P506','required',true),
        JSON_OBJECT('n',42,'grupo','Accesorios tuberia a mayor detalle','texto','BOMBA DE CONCRETO PC607/411 CIFA','codigo','PC607','required',true),
        JSON_OBJECT('n',43,'grupo','Accesorios tuberia a mayor detalle','texto','BOMBA DE CONCRETO TB30 TURBOSOL','codigo','TB30','required',true),
        JSON_OBJECT('n',44,'grupo','Accesorios tuberia a mayor detalle','texto','BOMBA DE CONCRETO TB50 TURBOSOL','codigo','TB50','required',true),
        JSON_OBJECT('n',45,'grupo','Accesorios tuberia a mayor detalle','texto','TUBO DE 3MT FLANCHE PLANO','codigo','TU553000FE52','required',true),
        JSON_OBJECT('n',46,'grupo','Accesorios tuberia a mayor detalle','texto','TUBO DE 2MT FLANCHE PLANO','codigo','TU552000','required',true),
        JSON_OBJECT('n',47,'grupo','Accesorios tuberia a mayor detalle','texto','TUBO DE 1MT FLANCHE PLANO','codigo','TU551000','required',true),
        JSON_OBJECT('n',48,'grupo','Accesorios tuberia a mayor detalle','texto','ABRAZADERA 3" FLANCHE PLANO','codigo','GF3','required',true),
        JSON_OBJECT('n',49,'grupo','Accesorios tuberia a mayor detalle','texto','EMPAQUE 3" FLANCHE PLANO','codigo','GU3','required',true),
        JSON_OBJECT('n',50,'grupo','Accesorios tuberia a mayor detalle','texto','ABRAZADERA 4" FLANCHE PLANO','codigo','GF45','required',true),
        JSON_OBJECT('n',51,'grupo','Accesorios tuberia a mayor detalle','texto','EMPAQUE 4" FLANCHE PLANO','codigo','GU45','required',true),
        JSON_OBJECT('n',52,'grupo','Accesorios tuberia a mayor detalle','texto','ABRAZADERA 5" FLANCHE PLANO','codigo','GF55','required',true),
        JSON_OBJECT('n',53,'grupo','Accesorios tuberia a mayor detalle','texto','EMPAQUE 5" FLANCHE PLANO','codigo','GU55','required',true),
        JSON_OBJECT('n',54,'grupo','Accesorios tuberia a mayor detalle','texto','ABRAZADERA ARRANQUE 5" CIFA','codigo','K000907858','required',true),
        JSON_OBJECT('n',55,'grupo','Accesorios tuberia a mayor detalle','texto','ABRAZADERA ARRANQUE 6" TURBOSOL','codigo','266782','required',true),
        JSON_OBJECT('n',56,'grupo','Accesorios tuberia a mayor detalle','texto','ATRAPA DIABLOS','codigo','DIABLO 5"','required',true),
        JSON_OBJECT('n',57,'grupo','Accesorios tuberia a mayor detalle','texto','CODO 45º R=1000 DE 5" FLANCHE PLANO','codigo','CA55R1000.45','required',true),
        JSON_OBJECT('n',58,'grupo','Accesorios tuberia a mayor detalle','texto','CODO 45º R=275 DE 5" FLANCHE PLANO','codigo','CUMN55R275.45','required',true),
        JSON_OBJECT('n',59,'grupo','Accesorios tuberia a mayor detalle','texto','CODO 45º R=500 DE 5" FLANCHE PLANO','codigo','CA55.R500.45.S4','required',true),
        JSON_OBJECT('n',60,'grupo','Accesorios tuberia a mayor detalle','texto','CODO 45º R=250 DE 5" FLANCHE PLANO','codigo','CA55R250.45','required',true),
        JSON_OBJECT('n',61,'grupo','Accesorios tuberia a mayor detalle','texto','CODO G0º R=1000 DE 5" FLANCHE PLANO','codigo','CA55R1000.90','required',true),
        JSON_OBJECT('n',62,'grupo','Accesorios tuberia a mayor detalle','texto','CODO G0º R=275 DE 5" FLANCHE PLANO','codigo','CUMN55R275.90D','required',true),
        JSON_OBJECT('n',63,'grupo','Accesorios tuberia a mayor detalle','texto','CODO G0º R=500 DE 5" FLANCHE PLANO','codigo','CA55.R500.90.S4','required',true),
        JSON_OBJECT('n',64,'grupo','Accesorios tuberia a mayor detalle','texto','CODO G0º R=250 DE 5" FLANCHE PLANO','codigo','CA55R250.90','required',true),
        JSON_OBJECT('n',65,'grupo','Accesorios tuberia a mayor detalle','texto','CODO DE SALIDA DE 6" TURBOSOL','codigo','261905','required',true),
        JSON_OBJECT('n',66,'grupo','Accesorios tuberia a mayor detalle','texto','CODO DE SALIDA DE 5" CIFA','codigo','S000224965','required',true),
        JSON_OBJECT('n',67,'grupo','Accesorios tuberia a mayor detalle','texto','EMPAQUE PARA CODO DE SALIDA CIFA','codigo','0','required',true),
        JSON_OBJECT('n',68,'grupo','Accesorios tuberia a mayor detalle','texto','MANGUERA DE 3” X 10 MT','codigo','TG80.075.100002X325','required',true),
        JSON_OBJECT('n',69,'grupo','Accesorios tuberia a mayor detalle','texto','MANGUERA DE 3” X 8 MT','codigo','MANCON3”X8','required',true),
        JSON_OBJECT('n',70,'grupo','Accesorios tuberia a mayor detalle','texto','MANGUERA DE 3” X 6 MT','codigo','MANCON3”','required',true),
        JSON_OBJECT('n',71,'grupo','Accesorios tuberia a mayor detalle','texto','MANGUERA DE 4” X 10 MT','codigo','TG80.100.10000','required',true),
        JSON_OBJECT('n',72,'grupo','Accesorios tuberia a mayor detalle','texto','MANGUERA DE 4” X 6MT','codigo','TG80.100.6000.2X45','required',true),
        JSON_OBJECT('n',73,'grupo','Accesorios tuberia a mayor detalle','texto','MANGUERA DE 5” X 6MT','codigo','TG801256000FP','required',true),
        JSON_OBJECT('n',74,'grupo','Accesorios tuberia a mayor detalle','texto','MIPLE','codigo','MIPLE','required',true),
        JSON_OBJECT('n',75,'grupo','Accesorios tuberia a mayor detalle','texto','REDUCCION DE 4" A 3"','codigo','NA0000043','required',true),
        JSON_OBJECT('n',80,'grupo','Accesorios tuberia a mayor detalle','texto','REDUCCION DE 5" A 4"','codigo','CF230664','required',true),
        JSON_OBJECT('n',76,'grupo','Accesorios tuberia a mayor detalle','texto','REDUCCION DE 6 A 5" TURBOSOL','codigo','261906','required',true),
        JSON_OBJECT('n',77,'grupo','Accesorios tuberia a mayor detalle','texto','VALVULA GUILLOTINA MANUAL DN 5.5”','codigo','VSM.BGU.55M','required',true),
        JSON_OBJECT('n',78,'grupo','Accesorios tuberia a mayor detalle','texto','EXTINTOR','codigo','0','required',true),
        JSON_OBJECT('n',79,'grupo','Accesorios tuberia a mayor detalle','texto','BOTIQUIN','codigo','0','required',true)
      ),

      /* Firmas / datos finales (tres bloques) */
      'firmas', JSON_OBJECT(
        'asistente_adm', JSON_OBJECT(
          'title','DATOS DE QUIEN REALIZA EL INVENTARIO ASISTENTE ADM',
          'fields', JSON_OBJECT(
            'nombre_legible', JSON_OBJECT('type','text','label','NOMBRE LEGIBLE:','required',true),
            'cargo',          JSON_OBJECT('type','text','label','CARGO:','required',true),
            'firma',          JSON_OBJECT('type','file','label','FIRMA:','accept',JSON_ARRAY('jpg','png'),'required',true),
            'fecha',          JSON_OBJECT('type','date','label','FECHA:') -- NO requerida
          )
        ),
        'operador', JSON_OBJECT(
          'title','DATOS A QUIEN SE LE REALIZA EL INVENTARIO OPERADOR',
          'fields', JSON_OBJECT(
            'nombre_legible', JSON_OBJECT('type','text','label','NOMBRE LEGIBLE:','required',true),
            'cargo',          JSON_OBJECT('type','text','label','CARGO:','required',true),
            'firma',          JSON_OBJECT('type','file','label','FIRMA:','accept',JSON_ARRAY('jpg','png'),'required',true),
            'fecha',          JSON_OBJECT('type','date','label','FECHA:') -- NO requerida
          )
        ),
        'auxiliar', JSON_OBJECT(
          'title','DATOS A QUIEN SE LE REALIZA EL INVENTARIO AUXILIAR',
          'fields', JSON_OBJECT(
            'nombre_legible', JSON_OBJECT('type','text','label','NOMBRE LEGIBLE:','required',true),
            'cargo',          JSON_OBJECT('type','text','label','CARGO:','required',true),
            'firma',          JSON_OBJECT('type','file','label','FIRMA:','accept',JSON_ARRAY('jpg','png'),'required',true),
            'fecha',          JSON_OBJECT('type','date','label','FECHA:') -- NO requerida
          )
        ),
        'lider_operativo', JSON_OBJECT(
          'title','DATOS DE QUIEN REALIZA EL INVENTARIO LIDER OPERATIVO',
          'fields', JSON_OBJECT(
            'nombre_legible', JSON_OBJECT('type','text','label','NOMBRE LEGIBLE:','required',true),
            'cargo',          JSON_OBJECT('type','text','label','CARGO:','required',true),
            'firma',          JSON_OBJECT('type','file','label','FIRMA:','accept',JSON_ARRAY('jpg','png'),'required',true),
            'fecha',          JSON_OBJECT('type','date','label','FECHA:') -- NO requerida
          )
        )
      )
    ),
    'ui', JSON_OBJECT(
      'allowDraft', true,
      'autoSave', true,
      'noteBeforeAccessories','NOTA: Los accesorios descritos anteriormente corresponden a los que llegan de fabrica con el equipo.'
    )
  ),
  1
);

-- 7) AIC Customer Journey
INSERT INTO retos (
  nombre_reto, descripcion_reto, tiempo_estimado_seg_reto,
  fecha_inicio_reto, fecha_fin_reto, es_automatico_reto,
  tipo_reto, metadata_reto, activo
)
VALUES (
  'AIC Customer Journey',
  'Plantilla de preventa → postventa. El usuario selecciona el PASO (combo) y registra la respuesta o acuerdo del cliente por cada actividad.',
  2400, '2025-01-01', '2099-12-31', 1, 'form',
  JSON_OBJECT(
    'kind','aic_customer_journey_v1',
    'schema', JSON_OBJECT(
      /* Columnas: PASO como combo + Respuesta del cliente como texto */
      'columns', JSON_ARRAY(
        JSON_OBJECT('key','n','label','#'),
        JSON_OBJECT(
          'key','valor','label','Paso','selectorType','combo',
          'options', JSON_ARRAY(
            'CREACION DEL CLIENTE',
            'DEMOSTRACIONES/PRUEBAS',
            'DESARROLLO DE LA VISITA',
            'FACTURACION',
            'Informes de Apoyo y Control',
            'PRESENTACIÓN',
            'PROSPECTACIÓN',
            'RECAUDO',
            'PRODUCTOS Y PLANES',
            'SERVICIO POSTVENTA',
            'X'
          ),
          'required', true
        ),
        JSON_OBJECT('key','observacion','label','Respuesta del cliente','type','text')
      ),

      /* Ítems (se conservan; el selector previo no se usa porque manda el combo de la columna) */
      'items', JSON_ARRAY(

        /* Preventa – PROSPECTACIÓN */
        JSON_OBJECT('n',1,'grupo','Preventa – PROSPECTACIÓN','texto','Exigencias de contratación','responsable','Coordinador Comercial','required',true),
        JSON_OBJECT('n',2,'grupo','Preventa – PROSPECTACIÓN','texto','Ubicación del proyecto (#pisos, #etapas, # aptos.).','responsable','Coordinador Comercial','required',true),
        JSON_OBJECT('n',3,'grupo','Preventa – PROSPECTACIÓN','texto','Necesidad del proyecto (requiere Bomba + TG, o solo Bomba.).','responsable','Coordinador Comercial','required',true),
        JSON_OBJECT('n',4,'grupo','Preventa – PROSPECTACIÓN','texto','% punto de equilibrio de ventas.','responsable','Coordinador Comercial','required',true),
        JSON_OBJECT('n',5,'grupo','Preventa – PROSPECTACIÓN','texto','Viabilidad del proyecto (recursos financieros). (Mi casa ya, Sub caja compensac. VIS, No VIS?).','responsable','Coordinador Comercial','required',true),

        /* Preventa – DESARROLLO DE LA VISITA */
        JSON_OBJECT('n',6,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Visita a proyecto','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',7,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Listado de necesidades específicas del proyecto respecto a equipo (Bomba, TG?).','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',8,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Punto de agua para lavado de equipo y tubería (¿qué tan lejos queda del equipo?).','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',9,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Elementos para la purga cerca a la bomba antes de fundir.','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',10,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Tipo de equipo.','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',11,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Tipo de concreto a fundir (asentamiento del concreto, ¿contiene fibra?).','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',12,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','¿Concreto de mixer o de planta?','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',13,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Especificación: tiempo máximo para fundir después de llegada de mixer a obra.','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',14,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Elementos a fundir.','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',15,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Capacidad requerida del equipo en horizontal y vertical.','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',16,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Ubicación del equipo – cuánta tubería lineal requiere.','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',17,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Qué tipo de mangueras se requieren.','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',18,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Tipo de lavado (con aire, con reversa, hacia adelante).','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',19,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Disposición final del concreto.','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',20,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Disposición final de residuos de mantenimientos preventivos de motor (aceite y filtros).','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',21,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Tipo de contratación: Mensualidades, específicos, bolsa de m3, específicos con contrato, stand by en m3.','responsable','Coordinador Comercial','required',true),
        JSON_OBJECT('n',22,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Características específicas / especiales del proyecto.','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',23,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Costo de transporte (según tipo de contratación).','responsable','Coordinador Comercial','required',true),
        JSON_OBJECT('n',24,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Horarios de trabajo y autorización de horas extra.','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',25,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Puntos de iluminación en caso de bombeos nocturnos.','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',26,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Transporte adicional diario.','responsable','Coordinador Comercial','required',true),
        JSON_OBJECT('n',27,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Restricciones de entrada/salida de equipos (permisos y horarios).','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',28,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','¿Aplica cobro de comidas?','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',29,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','¿Aplica cobro de transportes?','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',30,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','¿A quién se reporta qué?','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',31,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','¿Comités de obra o de SG-SST en la semana?','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',32,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Solicitud de mampara/protección para operario, auxiliar y equipo (techo resistente).','responsable','SG SST','required',true),
        JSON_OBJECT('n',33,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Revisión de puntos de anclaje en la obra (para la tubería).','responsable','SG SST','required',true),
        JSON_OBJECT('n',34,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Revisión líneas de vida y puntos de anclaje para equipo de alturas.','responsable','SG SST','required',true),
        JSON_OBJECT('n',35,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','¿Hay espacio para guardar el combustible en obra?','responsable','SG SST','required',true),
        JSON_OBJECT('n',36,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','¿Provisional para guardar accesorios y elementos de protección?','responsable','SG SST','required',true),
        JSON_OBJECT('n',37,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','Aspectos que califica el proyecto.','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',38,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','¿Quién toma la decisión sobre calificación?','responsable','Coordinador Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',44,'grupo','Preventa – DESARROLLO DE LA VISITA','texto','¿Se requieren protectores de losa (descansa tubería)?','responsable','Coordinador Comercial/Lider Operativo','required',true),

        /* Preventa – DEMOSTRACIONES / PRUEBAS */
        JSON_OBJECT('n',45,'grupo','Preventa – DEMOSTRACIONES / PRUEBAS','texto','Seguimiento','responsable','Coordinador Comercial','required',true),
        JSON_OBJECT('n',46,'grupo','Preventa – DEMOSTRACIONES / PRUEBAS','texto','Verificación proyecto y necesidades (formato Control Bombeo Específico).','responsable','Coordinador Comercial/Lider Operativo/Lider SG SST','required',true),
        JSON_OBJECT('n',47,'grupo','Preventa – DEMOSTRACIONES / PRUEBAS','texto','Prestación del Servicio (formato Control Bombeo Específico).','responsable','Coordinador Comercial/Lider Operativo/Lider SG SST','required',true),
        JSON_OBJECT('n',48,'grupo','Preventa – DEMOSTRACIONES / PRUEBAS','texto','Correo con evidencia fotográfica del servicio, firmada por representante del cliente.','responsable','Coordinador Comercial/Lider Operativo/Lider SG SST','required',true),

        /* Venta – CREACION DEL CLIENTE */
        JSON_OBJECT('n',49,'grupo','Venta – CREACION DEL CLIENTE','texto','Solicitud cupo de crédito del cliente.','responsable','Coordinador Comercial','required',true),
        JSON_OBJECT('n',50,'grupo','Venta – CREACION DEL CLIENTE','texto','Solicitud de pólizas de contrato y pago (si aplica).','responsable','Coordinador Comercial/Lider Administrativa','required',true),
        JSON_OBJECT('n',51,'grupo','Venta – CREACION DEL CLIENTE','texto','Aceptación por SIGNIO de Cotización, Manual de Bombeo y Procedimiento seguro de izaje.','responsable','Coordinador Comercial','required',true),
        JSON_OBJECT('n',52,'grupo','Venta – CREACION DEL CLIENTE','texto','Socialización SST cliente/contratista y registro de firmas de involucrados.','responsable','SG SST','required',true),

        /* Venta – FACTURACION */
        JSON_OBJECT('n',53,'grupo','Venta – FACTURACION','texto','Confirmar política de recepción de facturación (anexos, cierres, etc.).','responsable','Coordinador Comercial/Facturación','required',true),
        JSON_OBJECT('n',54,'grupo','Venta – FACTURACION','texto','Confirmar fechas y días de cortes de obra.','responsable','Coordinador Comercial/Facturación','required',true),
        JSON_OBJECT('n',55,'grupo','Venta – FACTURACION','texto','Verificar quién emite el corte de obra (nombre, cargo y celular).','responsable','Coordinador Comercial','required',true),
        JSON_OBJECT('n',56,'grupo','Venta – FACTURACION','texto','Verificar documentos requeridos para la emisión de corte de obra.','responsable','Coordinador Comercial','required',true),
        JSON_OBJECT('n',57,'grupo','Venta – FACTURACION','texto','Verificar fechas de recepción de facturas.','responsable','Coordinador Comercial/Facturación','required',true),

        /* Venta – RECAUDO */
        JSON_OBJECT('n',58,'grupo','Venta – RECAUDO','texto','Confirmar contactos para cobros de factura.','responsable','Coordinador Comercial/Cartera','required',true),

        /* Post Venta – SERVICIO POSTVENTA */
        JSON_OBJECT('n',59,'grupo','Post Venta – SERVICIO POSTVENTA','texto','Programación de asistencia a Comités del proyecto.','responsable','Lider Administrativa','required',true),
        JSON_OBJECT('n',60,'grupo','Post Venta – SERVICIO POSTVENTA','texto','Socialización de información del comité del proyecto.','responsable','Quien asista al comité','required',true),
        JSON_OBJECT('n',61,'grupo','Post Venta – SERVICIO POSTVENTA','texto','Programación visitas Líder Operativo.','responsable','Coord. Comercial/Lider Operativo','required',true),
        JSON_OBJECT('n',62,'grupo','Post Venta – SERVICIO POSTVENTA','texto','Programación visitas Líder Mecánico.','responsable','Coord. Comercial/Lider Mecánico','required',true),
        JSON_OBJECT('n',63,'grupo','Post Venta – SERVICIO POSTVENTA','texto','Programación visitas Líder SG SST (Hallazgos, permisos de altura, etc.).','responsable','Coord. Comercial/Lider SG SST','required',true),
        JSON_OBJECT('n',64,'grupo','Post Venta – SERVICIO POSTVENTA','texto','Verificación condiciones de obra.','responsable','—','required',true),
        JSON_OBJECT('n',65,'grupo','Post Venta – SERVICIO POSTVENTA','texto','Solicitud y verificación de iluminación.','responsable','Lider SG SST','required',true),
        JSON_OBJECT('n',66,'grupo','Post Venta – SERVICIO POSTVENTA','texto','Solicitud cuarto provisional (accesorios y cambio de vestuario).','responsable','Lider SG SST','required',true),
        JSON_OBJECT('n',68,'grupo','Post Venta – SERVICIO POSTVENTA','texto','Director de obra: nombre, celular y correo electrónico.','responsable','Coordinador Comercial/Lider SG SST','required',true),
        JSON_OBJECT('n',69,'grupo','Post Venta – SERVICIO POSTVENTA','texto','Residente de obra: nombre, celular y correo electrónico.','responsable','Coordinador Comercial/Lider SG SST','required',true),
        JSON_OBJECT('n',70,'grupo','Post Venta – SERVICIO POSTVENTA','texto','SISO de obra: nombre, celular y correo electrónico.','responsable','Coordinador Comercial/Lider SG SST','required',true),
        JSON_OBJECT('n',71,'grupo','Post Venta – SERVICIO POSTVENTA','texto','Master asignado: nombre, celular y correo electrónico.','responsable','Coordinador Comercial/Lider SG SST','required',true),
        JSON_OBJECT('n',72,'grupo','Post Venta – SERVICIO POSTVENTA','texto','Emisión y radicación de QRS.','responsable','Coordinador Comercial/Lider SG SST','required',true),
        JSON_OBJECT('n',74,'grupo','Post Venta – SERVICIO POSTVENTA','texto','Envío informe de obra SG SST.','responsable','Lider SG SST','required',true),
        JSON_OBJECT('n',75,'grupo','Post Venta – SERVICIO POSTVENTA','texto','Envío documentación requerida de personal de obra.','responsable','Lider SG SST','required',true),
        JSON_OBJECT('n',76,'grupo','Post Venta – SERVICIO POSTVENTA','texto','Envío seguridad social del personal a cada proyecto.','responsable','Lider SG SST','required',true),
        JSON_OBJECT('n',77,'grupo','Post Venta – SERVICIO POSTVENTA','texto','Envío pago y relación del FIC a cada proyecto.','responsable','Lider SG SST','required',true),
        JSON_OBJECT('n',80,'grupo','Post Venta – SERVICIO POSTVENTA','texto','Protocolo en caso de varada.','responsable','Coordinador Comercial/Lider Administrativo','required',true),
        JSON_OBJECT('n',81,'grupo','Post Venta – SERVICIO POSTVENTA','texto','Protocolo en caso de accidente.','responsable','Coordinador Comercial/Lider SG SST','required',true),
        JSON_OBJECT('n',82,'grupo','Post Venta – SERVICIO POSTVENTA','texto','Qué hacer en caso de falta de personal en obra.','responsable','Coordinador Comercial/Lider Operat/Lider SG SST','required',true),
        JSON_OBJECT('n',83,'grupo','Post Venta – SERVICIO POSTVENTA','texto','Cobros por daños a equipos por material dentro del concreto.','responsable','Coordinador Comercial/Operario/Lider Operativo','required',true),

        /* Post Venta – Informes de Apoyo y Control */
        JSON_OBJECT('n',84,'grupo','Post Venta – Informes de Apoyo y Control','texto','Informe de Hallazgos SG SST.','responsable','Lider SG SST','required',true),
        JSON_OBJECT('n',86,'grupo','Post Venta – Informes de Apoyo y Control','texto','Control vencimiento exámenes médicos.','responsable','Comité revisión mensual','required',true),
        JSON_OBJECT('n',87,'grupo','Post Venta – Informes de Apoyo y Control','texto','Inventarios de tubería, radios y mangueras.','responsable','Lider Operativo','required',true),
        JSON_OBJECT('n',89,'grupo','Post Venta – Informes de Apoyo y Control','texto','Informe Operativo.','responsable','Lider Operativo','required',true),
        JSON_OBJECT('n',91,'grupo','Post Venta – Informes de Apoyo y Control','texto','Cuadro control recertificación arnés y eslingas.','responsable','Lider SG SST','required',true),
        JSON_OBJECT('n',94,'grupo','Post Venta – Informes de Apoyo y Control','texto','Control Entrega de EPPS.','responsable','Lider SG SST','required',true)
      )
    ),
    'ui', JSON_OBJECT('allowDraft', true,'autoSave', true)
  ),
  1
);

-- 8) Prueba de archivos
-- PDF
INSERT INTO retos (
  nombre_reto,
  descripcion_reto,
  tiempo_estimado_seg_reto,
  fecha_inicio_reto,
  fecha_fin_reto,
  es_automatico_reto,
  tipo_reto,
  activo,
  metadata_reto
) VALUES (
  'Entrega de reporte PDF',
  'Subir un archivo en formato PDF con la revisión de repuestos y estado del proyecto.',
  600,
  '2025-08-15',
  '2025-10-30',
  0,
  'archivo',
  1,
  '{"kind":"archivo","instrucciones":"Adjuntar reporte técnico en PDF","tiposPermitidos":["pdf"]}'
);

-- Imágenes
INSERT INTO retos (
  nombre_reto,
  descripcion_reto,
  tiempo_estimado_seg_reto,
  fecha_inicio_reto,
  fecha_fin_reto,
  es_automatico_reto,
  tipo_reto,
  activo,
  metadata_reto
) VALUES (
  'Evidencia fotográfica',
  'Subir imágenes (JPG, PNG o WEBP) del estado actual del equipo.',
  600,
  '2025-08-10',
  '2025-10-30',
  0,
  'archivo',
  1,
  '{"kind":"archivo","instrucciones":"Adjuntar 1 a 3 fotos claras","tiposPermitidos":["jpg","png","webp"]}'
);

-- Videos
INSERT INTO retos (
  nombre_reto,
  descripcion_reto,
  tiempo_estimado_seg_reto,
  fecha_inicio_reto,
  fecha_fin_reto,
  es_automatico_reto,
  tipo_reto,
  activo,
  metadata_reto
) VALUES (
  'Registro en video',
  'Subir un archivo de video corto mostrando la prueba de funcionamiento.',
  900,
  '2025-08-20',
  '2025-10-30',
  0,
  'archivo',
  1,
  '{"kind":"archivo","instrucciones":"Sube un video (mp4 o mov) de máximo 1 minuto","tiposPermitidos":["mp4","mov"]}'
);


INSERT INTO usuarios_retos(cod_usuario,cod_reto,estado,ventana_inicio,ventana_fin) 
VALUES(2,8,"asignado",'2025-08-15', '2025-10-30');
INSERT INTO usuarios_retos(cod_usuario,cod_reto,estado,ventana_inicio,ventana_fin) 
VALUES(2,9,"asignado",'2025-08-10', '2025-10-30');
INSERT INTO usuarios_retos(cod_usuario,cod_reto,estado,ventana_inicio,ventana_fin) 
VALUES(2,10,"asignado",'2025-08-20', '2025-10-30');

INSERT INTO cargos_retos(cod_cargo_usuario, cod_reto)
VALUES(2, 1), 
(2,2),
(2,3),
(2,4),
(1,5),
(1,6),
(1,7);


