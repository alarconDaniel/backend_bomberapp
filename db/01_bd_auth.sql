-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema bd_auth
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema bd_auth
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `bd_auth` DEFAULT CHARACTER SET utf8 ;
USE `bd_auth` ;

-- -----------------------------------------------------
-- Table `bd_auth`.`roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_auth`.`roles` (
  `cod_rol` INT NOT NULL AUTO_INCREMENT,
  `nombre_rol` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`cod_rol`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bd_auth`.`usuarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bd_auth`.`usuarios` (
  `cod_usuario` INT NOT NULL AUTO_INCREMENT,
  `nombre_usuario` VARCHAR(255) NOT NULL,
  `apellido_usuario` VARCHAR(255) NOT NULL,
  `nickname_usuario` VARCHAR(255) NULL,
  `correo_usuario` VARCHAR(255) NOT NULL,
  `contrasena_usuario` VARCHAR(255) NOT NULL,
  `cedula_usuario` VARCHAR(45) NOT NULL,
  `cod_rol` INT NOT NULL,
  `refresh_token_hash` VARCHAR(500) NULL,
  `token_version` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`cod_usuario`, `cod_rol`),
  INDEX `fk_usuarios_roles1_idx` (`cod_rol` ASC) VISIBLE,
  UNIQUE INDEX `correo_usuario_UNIQUE` (`correo_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_usuarios_roles1`
    FOREIGN KEY (`cod_rol`)
    REFERENCES `bd_auth`.`roles` (`cod_rol`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
