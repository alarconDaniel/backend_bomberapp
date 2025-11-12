-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema bd_bomberapp
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema bd_bomberapp
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `bd_bomberapp` DEFAULT CHARACTER SET utf8 ;
USE `bd_bomberapp` ;

-- -----------------------------------------------------
-- Table `bd_bomberapp`.`roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`roles` (
  `cod_rol` INT NOT NULL AUTO_INCREMENT,
  `nombre_rol` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`cod_rol`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`cargos_usuarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`cargos_usuarios` (
  `cod_cargo_usuario` INT NOT NULL AUTO_INCREMENT,
  `nombre_cargo` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`cod_cargo_usuario`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`usuarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`usuarios` (
  `cod_usuario` INT NOT NULL AUTO_INCREMENT,
  `nombre_usuario` VARCHAR(255) NOT NULL,
  `apellido_usuario` VARCHAR(255) NOT NULL,
  `nickname_usuario` VARCHAR(255) NULL,
  `correo_usuario` VARCHAR(255) NOT NULL,
  `contrasena_usuario` VARCHAR(255) NOT NULL,
  `cedula_usuario` VARCHAR(45) NOT NULL,
  `cod_cargo_usuario` INT NULL,
  `cod_rol` INT NOT NULL,
  `refresh_token_hash` VARCHAR(500) NULL,
  `token_version` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`cod_usuario`, `cod_rol`),
  INDEX `fk_usuarios_roles1_idx` (`cod_rol` ASC) VISIBLE,
  UNIQUE INDEX `correo_usuario_UNIQUE` (`correo_usuario` ASC) VISIBLE,
  INDEX `fk_usuarios_cargos_usuarios1_idx` (`cod_cargo_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_usuarios_roles1`
    FOREIGN KEY (`cod_rol`)
    REFERENCES `bd_bomberapp`.`roles` (`cod_rol`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_usuarios_cargos_usuarios1`
    FOREIGN KEY (`cod_cargo_usuario`)
    REFERENCES `bd_bomberapp`.`cargos_usuarios` (`cod_cargo_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`retos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`retos` (
  `cod_reto` INT NOT NULL AUTO_INCREMENT,
  `nombre_reto` VARCHAR(255) NOT NULL,
  `descripcion_reto` LONGTEXT NOT NULL,
  `tiempo_estimado_seg_reto` INT NOT NULL COMMENT 'Se refiere al tiempo estimado que toma hacer el reto',
  `fecha_inicio_reto` DATE NOT NULL,
  `fecha_fin_reto` DATE NOT NULL,
  `es_automatico_reto` TINYINT NOT NULL,
  `tipo_reto` ENUM("quiz", "form", "archivo") NOT NULL,
  `metadata_reto` JSON NULL,
  `activo` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`cod_reto`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`usuarios_retos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`usuarios_retos` (
  `cod_usuario_reto` INT NOT NULL AUTO_INCREMENT,
  `cod_usuario` INT NOT NULL,
  `cod_reto` INT NOT NULL,
  `estado` ENUM("asignado", "en_progreso", "abandonado", "completado", "vencido") NOT NULL DEFAULT 'asignado' COMMENT 'Expresa si ya se completo o no el reto por el usuario respectivo',
  `fecha_complecion` DATETIME NULL COMMENT 'Expresa en que fecha se completo el reto',
  `empezado_en` DATETIME NULL,
  `terminado_en` DATETIME NULL,
  `tiempo_complecion_seg` INT GENERATED ALWAYS AS (IF(empezado_en IS NULL OR terminado_en IS NULL, NULL,
   TIMESTAMPDIFF(SECOND, empezado_en, terminado_en))
) STORED COMMENT 'Mide automaticamente el tiempo que se demoro el usuario en contestar el reto basando en \"empezado_en\" y \"finalizado_en\", guardando la duracion en segundos.',
  `fecha_objetivo` DATE NULL,
  `ventana_inicio` DATE NULL,
  `ventana_fin` DATE NULL,
  PRIMARY KEY (`cod_usuario_reto`, `cod_usuario`),
  INDEX `fk_usuarios_has_retos_retos1_idx` (`cod_reto` ASC) INVISIBLE,
  INDEX `fk_usuarios_has_retos_usuarios_idx` (`cod_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_usuarios_has_retos_usuarios`
    FOREIGN KEY (`cod_usuario`)
    REFERENCES `bd_bomberapp`.`usuarios` (`cod_usuario`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_usuarios_has_retos_retos1`
    FOREIGN KEY (`cod_reto`)
    REFERENCES `bd_bomberapp`.`retos` (`cod_reto`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'Lo que define principalmente esta tabla es la asignacion de un usuario a un reto, entonces esto es util para definir los cargos a los cuales les va a aparecer un reto en especifico.';


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`preguntas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`preguntas` (
  `cod_pregunta` INT NOT NULL AUTO_INCREMENT,
  `numero_pregunta` INT NOT NULL COMMENT 'Indica el orden de la pregunta, es la primera, la segunda, la tercera',
  `enunciado_pregunta` TEXT NOT NULL,
  `tipo_pregunta` ENUM("abcd", "rellenar", "emparejar") NOT NULL,
  `puntos_pregunta` INT NOT NULL DEFAULT 1,
  `tiempo_max_pregunta` INT NOT NULL,
  `cod_reto` INT NOT NULL,
  PRIMARY KEY (`cod_pregunta`, `cod_reto`),
  INDEX `fk_preguntas_retos1_idx` (`cod_reto` ASC) VISIBLE,
  CONSTRAINT `fk_preguntas_retos1`
    FOREIGN KEY (`cod_reto`)
    REFERENCES `bd_bomberapp`.`retos` (`cod_reto`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`opciones_abcd`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`opciones_abcd` (
  `cod_opcion` INT NOT NULL AUTO_INCREMENT,
  `texto_opcion` VARCHAR(255) NOT NULL COMMENT 'Importante verificar que solo sea de 255 caracteres',
  `validez_opcion` TINYINT NOT NULL DEFAULT 0 COMMENT 'Indica si la respuesta es correcta o no, de default tiene cero, que no es correcta. Pero se deberia validar que las preguntas tengan por lo menos una correcta',
  `cod_pregunta` INT NOT NULL,
  PRIMARY KEY (`cod_opcion`, `cod_pregunta`),
  INDEX `fk_opciones_abcd_preguntas1_idx` (`cod_pregunta` ASC) VISIBLE,
  CONSTRAINT `fk_opciones_abcd_preguntas1`
    FOREIGN KEY (`cod_pregunta`)
    REFERENCES `bd_bomberapp`.`preguntas` (`cod_pregunta`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`preguntas_rellenar`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`preguntas_rellenar` (
  `cod_pregunta_rellenar` INT NOT NULL AUTO_INCREMENT,
  `texto_pregunta` TEXT NOT NULL,
  `respuesta_correcta` VARCHAR(255) NOT NULL,
  `cod_pregunta` INT NOT NULL,
  PRIMARY KEY (`cod_pregunta_rellenar`, `cod_pregunta`),
  INDEX `fk_preguntas_rellenar_preguntas1_idx` (`cod_pregunta` ASC) VISIBLE,
  CONSTRAINT `fk_preguntas_rellenar_preguntas1`
    FOREIGN KEY (`cod_pregunta`)
    REFERENCES `bd_bomberapp`.`preguntas` (`cod_pregunta`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`items_emparejamiento`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`items_emparejamiento` (
  `cod_item` INT NOT NULL AUTO_INCREMENT,
  `lado` ENUM("A", "B") NOT NULL COMMENT 'Indica la columna en la que está, digamos\n \nINSERT INTO matching_items (pregunta_id, lado, contenido) VALUES\n(1, \'A\', \'Colombia\'),   -- id = 1\n(1, \'A\', \'Francia\'),    -- id = 2\n(1, \'A\', \'Japón\');      -- id = 3\n(1, \'B\', \'Tokio\'),      -- id = 4\n(1, \'B\', \'París\'),      -- id = 5\n(1, \'B\', \'Bogotá\');     -- id = 6\n\nLuego en parejas correctas, se almacenan los ids que corresponden',
  `contenido` VARCHAR(255) NOT NULL,
  `cod_pregunta` INT NOT NULL,
  PRIMARY KEY (`cod_item`, `cod_pregunta`),
  INDEX `fk_items_emparejamiento_preguntas1_idx` (`cod_pregunta` ASC) VISIBLE,
  CONSTRAINT `fk_items_emparejamiento_preguntas1`
    FOREIGN KEY (`cod_pregunta`)
    REFERENCES `bd_bomberapp`.`preguntas` (`cod_pregunta`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`parejas_correctas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`parejas_correctas` (
  `cod_pareja` INT NOT NULL AUTO_INCREMENT,
  `cod_item_A` INT NOT NULL,
  `cod_item_B` INT NOT NULL,
  `cod_pregunta` INT NOT NULL,
  PRIMARY KEY (`cod_pareja`, `cod_pregunta`),
  INDEX `fk_parejas_correctas_preguntas1_idx` (`cod_pregunta` ASC) VISIBLE,
  CONSTRAINT `fk_parejas_correctas_preguntas1`
    FOREIGN KEY (`cod_pregunta`)
    REFERENCES `bd_bomberapp`.`preguntas` (`cod_pregunta`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`tokens_reinicio_contrasena`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`tokens_reinicio_contrasena` (
  `cod_token` INT NOT NULL AUTO_INCREMENT,
  `token` VARCHAR(255) NOT NULL,
  `expiracion_token` DATETIME NOT NULL,
  `cod_usuario` INT NOT NULL,
  PRIMARY KEY (`cod_token`, `cod_usuario`),
  INDEX `fk_tokens_reinicio_contrasena_usuarios1_idx` (`cod_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_tokens_reinicio_contrasena_usuarios1`
    FOREIGN KEY (`cod_usuario`)
    REFERENCES `bd_bomberapp`.`usuarios` (`cod_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`items_tienda`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`items_tienda` (
  `cod_item` INT NOT NULL AUTO_INCREMENT,
  `nombre_item` VARCHAR(255) NOT NULL,
  `descripcion_item` TEXT NOT NULL,
  `precio_item` INT NOT NULL,
  `tipo_item` ENUM("potenciador", "ropa", "cofre") NOT NULL,
  `icono_item` VARCHAR(255) NOT NULL,
  `metadata_item` JSON NULL COMMENT 'Funciona para almacenar información extra de los modelos 3d de ropa y demás',
  `slot_item` ENUM('cabeza', 'torso', 'piernas', 'pies', 'extra') NULL,
  PRIMARY KEY (`cod_item`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`items_inventario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`items_inventario` (
  `cod_item_inventario` INT NOT NULL AUTO_INCREMENT,
  `cod_usuario` INT NOT NULL,
  `cod_item` INT NOT NULL,
  `cantidad_item` INT NOT NULL,
  `fecha_compra_item` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cod_item_inventario`, `cod_usuario`, `cod_item`),
  INDEX `fk_items_inventario_items_tienda1_idx` (`cod_item` ASC) VISIBLE,
  UNIQUE INDEX `uk_inventario_usuario_item` (`cod_usuario` ASC, `cod_item` ASC) VISIBLE,
  CONSTRAINT `fk_items_inventario_usuarios1`
    FOREIGN KEY (`cod_usuario`)
    REFERENCES `bd_bomberapp`.`usuarios` (`cod_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_items_inventario_items_tienda1`
    FOREIGN KEY (`cod_item`)
    REFERENCES `bd_bomberapp`.`items_tienda` (`cod_item`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`estadisticas_usuarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`estadisticas_usuarios` (
  `cod_estadistica` INT NOT NULL AUTO_INCREMENT,
  `cod_usuario` INT NOT NULL,
  `monedas_estadistica` INT NOT NULL DEFAULT 0,
  `racha_estadistica` INT NOT NULL DEFAULT 0,
  `xp_estadistica` INT NOT NULL DEFAULT 0 COMMENT 'La experiencia total con la que cuenta el usuario, los niveles se calculan en el backend de la aplicación',
  `mejor_racha_estadistica` INT NOT NULL DEFAULT 0,
  `ultima_fecha_racha` DATE NULL,
  PRIMARY KEY (`cod_estadistica`, `cod_usuario`),
  CONSTRAINT `fk_estadisticas_usuario_usuarios1`
    FOREIGN KEY (`cod_usuario`)
    REFERENCES `bd_bomberapp`.`usuarios` (`cod_usuario`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`logros`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`logros` (
  `cod_logro` INT NOT NULL AUTO_INCREMENT,
  `nombre_logro` VARCHAR(255) NOT NULL,
  `descripcion_logro` MEDIUMTEXT NOT NULL,
  `icono_logro` VARCHAR(255) NOT NULL COMMENT 'Es la ruta para guardar el icono en un servidor o en local.',
  `recompensa_logro` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`cod_logro`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`usuarios_logros`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`usuarios_logros` (
  `cod_usuario_logro` INT NOT NULL AUTO_INCREMENT,
  `cod_usuario` INT NOT NULL,
  `cod_logro` INT NOT NULL,
  `fecha_obtencion_logro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cod_usuario_logro`, `cod_usuario`, `cod_logro`),
  INDEX `fk_usuarios_has_logros_logros1_idx` (`cod_logro` ASC) VISIBLE,
  INDEX `fk_usuarios_has_logros_usuarios1_idx` (`cod_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_usuarios_has_logros_usuarios1`
    FOREIGN KEY (`cod_usuario`)
    REFERENCES `bd_bomberapp`.`usuarios` (`cod_usuario`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_usuarios_has_logros_logros1`
    FOREIGN KEY (`cod_logro`)
    REFERENCES `bd_bomberapp`.`logros` (`cod_logro`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`trofeos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`trofeos` (
  `cod_trofeo` INT NOT NULL AUTO_INCREMENT,
  `nombre_trofeo` VARCHAR(255) NOT NULL,
  `descripcion_trofeo` MEDIUMTEXT NOT NULL,
  `icono_trofeo` VARCHAR(255) NOT NULL,
  `recompensa_trofeo` VARCHAR(255) NOT NULL,
  `cod_usuario` INT NULL,
  PRIMARY KEY (`cod_trofeo`),
  INDEX `fk_trofeos_usuarios1_idx` (`cod_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_trofeos_usuarios1`
    FOREIGN KEY (`cod_usuario`)
    REFERENCES `bd_bomberapp`.`usuarios` (`cod_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'Es la tabla que almacena los trofeos que los ujsuarios pueden tener, sui diferencia con los logros es que se cambian entre usuarios, solo un usuario puede tener el trofeo de una cierta categoria.';


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`auditoria_trofeos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`auditoria_trofeos` (
  `cod_auditoria` INT NOT NULL AUTO_INCREMENT,
  `cod_trofeo` INT NOT NULL,
  `prev_cod_usuario` INT NULL,
  `nuevo_cod_usuario` INT NULL,
  `cambiado_en` DATETIME NULL,
  `motivo_auditoria` VARCHAR(255) NOT NULL,
  `metricas_auditoria` JSON NULL,
  PRIMARY KEY (`cod_auditoria`, `cod_trofeo`),
  INDEX `fk_auditoria_trofeos_trofeos1_idx` (`cod_trofeo` ASC) VISIBLE,
  INDEX `fk_auditoria_trofeos_usuarios1_idx` (`prev_cod_usuario` ASC) VISIBLE,
  INDEX `fk_auditoria_trofeos_usuarios2_idx` (`nuevo_cod_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_auditoria_trofeos_trofeos1`
    FOREIGN KEY (`cod_trofeo`)
    REFERENCES `bd_bomberapp`.`trofeos` (`cod_trofeo`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_auditoria_trofeos_usuarios1`
    FOREIGN KEY (`prev_cod_usuario`)
    REFERENCES `bd_bomberapp`.`usuarios` (`cod_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_auditoria_trofeos_usuarios2`
    FOREIGN KEY (`nuevo_cod_usuario`)
    REFERENCES `bd_bomberapp`.`usuarios` (`cod_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`respuestas_preguntas_usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`respuestas_preguntas_usuario` (
  `cod_respuesta` INT NOT NULL AUTO_INCREMENT,
  `cod_usuario_reto` INT NOT NULL,
  `cod_pregunta` INT NOT NULL,
  `respondido_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tiempo_seg` INT NULL,
  `valor_json` JSON NULL COMMENT '{\"abcd\":[12]} | {\"rellenar\":\"texto\"} | {\"emparejar\":[[1,6],[2,5],[3,4]]} | {\"reporte\":{\"files\":[...]}}',
  `es_correcta` TINYINT NULL,
  `puntaje` INT NULL,
  PRIMARY KEY (`cod_respuesta`, `cod_usuario_reto`, `cod_pregunta`),
  INDEX `fk_respuestas_preguntas_usuario_usuarios_retos1_idx` (`cod_usuario_reto` ASC) VISIBLE,
  INDEX `fk_respuestas_preguntas_usuario_preguntas1_idx` (`cod_pregunta` ASC) VISIBLE,
  CONSTRAINT `fk_respuestas_preguntas_usuario_usuarios_retos1`
    FOREIGN KEY (`cod_usuario_reto`)
    REFERENCES `bd_bomberapp`.`usuarios_retos` (`cod_usuario_reto`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_respuestas_preguntas_usuario_preguntas1`
    FOREIGN KEY (`cod_pregunta`)
    REFERENCES `bd_bomberapp`.`preguntas` (`cod_pregunta`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`respuestas_formulario_usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`respuestas_formulario_usuario` (
  `cod_respuesta_form` INT NOT NULL AUTO_INCREMENT,
  `data` JSON NOT NULL COMMENT 'snapshot del formulario diligenciado',
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `terminado_en` DATETIME NULL,
  `cod_usuario_reto` INT NOT NULL,
  `cod_reto` INT NOT NULL,
  PRIMARY KEY (`cod_respuesta_form`, `cod_usuario_reto`, `cod_reto`),
  INDEX `fk_respuestas_formulario_usuario_usuarios_retos1_idx` (`cod_usuario_reto` ASC) VISIBLE,
  INDEX `fk_respuestas_formulario_usuario_retos1_idx` (`cod_reto` ASC) VISIBLE,
  CONSTRAINT `fk_respuestas_formulario_usuario_usuarios_retos1`
    FOREIGN KEY (`cod_usuario_reto`)
    REFERENCES `bd_bomberapp`.`usuarios_retos` (`cod_usuario_reto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_respuestas_formulario_usuario_retos1`
    FOREIGN KEY (`cod_reto`)
    REFERENCES `bd_bomberapp`.`retos` (`cod_reto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`archivos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`archivos` (
  `cod_archivo` INT NOT NULL AUTO_INCREMENT,
  `cod_usuario` INT NOT NULL,
  `ruta_archivo` VARCHAR(512) NULL,
  `nombre_original` VARCHAR(255) NOT NULL,
  `tipo_contenido` VARCHAR(255) NOT NULL,
  `area` VARCHAR(255) NULL,
  `tamano_bytes` BIGINT NULL,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP NULL DEFAULT NULL,
  `provider` ENUM('s3', 'drive') NULL,
  `bucket` VARCHAR(128) NULL,
  `key_path` VARCHAR(512) NULL,
  `ext_id` VARCHAR(256) NULL,
  `storage_etag` VARCHAR(64) NULL,
  `checksum_sha256` VARBINARY(32) NULL,
  `storage_created_at` DATETIME NULL,
  PRIMARY KEY (`cod_archivo`),
  INDEX `fk_archivos_usuarios1_idx` (`cod_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_archivos_usuarios1`
    FOREIGN KEY (`cod_usuario`)
    REFERENCES `bd_bomberapp`.`usuarios` (`cod_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`cargos_retos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`cargos_retos` (
  `cod_cargo_reto` INT NOT NULL AUTO_INCREMENT,
  `cod_cargo_usuario` INT NOT NULL,
  `cod_reto` INT NOT NULL,
  PRIMARY KEY (`cod_cargo_reto`, `cod_cargo_usuario`, `cod_reto`),
  INDEX `fk_cargos_usuarios_has_retos_retos1_idx` (`cod_reto` ASC) VISIBLE,
  INDEX `fk_cargos_usuarios_has_retos_cargos_usuarios1_idx` (`cod_cargo_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_cargos_usuarios_has_retos_cargos_usuarios1`
    FOREIGN KEY (`cod_cargo_usuario`)
    REFERENCES `bd_bomberapp`.`cargos_usuarios` (`cod_cargo_usuario`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_cargos_usuarios_has_retos_retos1`
    FOREIGN KEY (`cod_reto`)
    REFERENCES `bd_bomberapp`.`retos` (`cod_reto`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`usos_comodines`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`usos_comodines` (
  `cod_uso` INT NOT NULL AUTO_INCREMENT,
  `cod_usuario_reto` INT NOT NULL,
  `cod_usuario` INT NOT NULL,
  `tipo` ENUM('50/50', 'mas_tiempo', 'protector_racha', 'double', 'ave_fenix') NOT NULL,
  `payload` JSON NULL,
  `usado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cod_uso`, `cod_usuario_reto`, `cod_usuario`),
  INDEX `fk_usos_comodines_usuarios_retos1_idx` (`cod_usuario_reto` ASC, `cod_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_usos_comodines_usuarios_retos1`
    FOREIGN KEY (`cod_usuario_reto` , `cod_usuario`)
    REFERENCES `bd_bomberapp`.`usuarios_retos` (`cod_usuario_reto` , `cod_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bd_bomberapp`.`avatar_equipado`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_bomberapp`.`avatar_equipado` (
  `cod_avatar_equipado` INT NOT NULL AUTO_INCREMENT,
  `slot` ENUM('cabeza', 'torso', 'piernas', 'pies', 'extra') NOT NULL,
  `cod_usuario` INT NOT NULL,
  `cod_item_inventario` INT NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cod_avatar_equipado`, `cod_usuario`, `cod_item_inventario`),
  INDEX `fk_avatar_equipado_usuarios1_idx` (`cod_usuario` ASC) VISIBLE,
  INDEX `fk_avatar_equipado_items_inventario1_idx` (`cod_item_inventario` ASC) VISIBLE,
  UNIQUE INDEX `uq_usuario_slot` (`cod_usuario` ASC, `slot` ASC) VISIBLE,
  UNIQUE INDEX `uq_item_unico` (`cod_item_inventario` ASC) VISIBLE,
  CONSTRAINT `fk_avatar_equipado_usuarios1`
    FOREIGN KEY (`cod_usuario`)
    REFERENCES `bd_bomberapp`.`usuarios` (`cod_usuario`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_avatar_equipado_items_inventario1`
    FOREIGN KEY (`cod_item_inventario`)
    REFERENCES `bd_bomberapp`.`items_inventario` (`cod_item_inventario`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

USE `bd_bomberapp`;

DELIMITER $$
USE `bd_bomberapp`$$
CREATE DEFINER = CURRENT_USER TRIGGER `bd_bomberapp`.`usuarios_AFTER_INSERT` AFTER INSERT ON `usuarios` FOR EACH ROW
BEGIN
INSERT INTO estadisticas_usuarios (cod_usuario, monedas_estadistica, racha_estadistica, xp_estadistica)
VALUES (NEW.cod_usuario, 0, 0, 0);
END$$

USE `bd_bomberapp`$$
CREATE DEFINER = CURRENT_USER TRIGGER `bd_bomberapp`.`usuarios_retos_BEFORE_UPDATE` BEFORE UPDATE ON `usuarios_retos` FOR EACH ROW
BEGIN
  -- Al pasar a EN_PROGRESO, marca inicio si no existe
  IF NEW.estado = 'en_progreso' AND OLD.estado <> 'en_progreso' THEN
    IF NEW.empezado_en IS NULL THEN
      SET NEW.empezado_en = NOW();
    END IF;
  END IF;

  -- Al pasar a COMPLETADO / ABANDONADO / VENCIDO, marca fin si no existe
  IF NEW.estado IN ('completado','abandonado','vencido')
     AND OLD.estado NOT IN ('completado','abandonado','vencido') THEN
    IF NEW.terminado_en IS NULL THEN
      SET NEW.terminado_en = NOW();
    END IF;
  END IF;

  -- Si quedó COMPLETADO, sella fecha_complecion (usando terminado_en)
  IF NEW.estado = 'completado' AND OLD.estado <> 'completado' THEN
    IF NEW.fecha_complecion IS NULL THEN
      SET NEW.fecha_complecion = COALESCE(NEW.terminado_en, NOW());
    END IF;
  END IF;
END$$


DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
