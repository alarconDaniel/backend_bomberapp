USE bd_bomberapp;

INSERT INTO roles(nombre_rol) VALUES ("admin"),("operario");

INSERT INTO cargos_usuarios(nombre_cargo) VALUES ("BomberMan"), ("GruaMan"), ("Robin");

-- clave segura para hashear en argon2i: zzzesclave
-- node -e "const a=require('argon2'); a.hash('cal1don!!',{type:a.argon2id}).then(h=>console.log(h))"
INSERT INTO usuarios(nombre_usuario, apellido_usuario, correo_usuario, contrasena_usuario, cod_cargo_usuario, cod_rol, cedula_usuario, nickname_usuario)
VALUES
-- Administradora
("Hoshimi", "Miyabi", "hoshimi.miyabi@gruasyequipos.com", "$argon2id$v=19$m=65536,t=3,p=4$OaUtNOb7FLxaH6yCqoqjeQ$c5fPMkcG176kD/rj9P4Zaq/KBphbGnSdQdPr//RFLO4", NULL, 1, "77415156123", NULL), -- wat3rm3l0n014

-- Operarias
("Jane", "Doe", "jane.doe@gruasyequipos.com", "$argon2id$v=19$m=65536,t=3,p=4$cb7GY5gq0h6G6eDXCZCABQ$MZVidZHtAnh1Kll26Tfeb8ZfDGI1+Q93zbuaGQ63Wg8", 2, 2, "81932143", "ElAmorDeTuVida"), -- satrex1602
("Burnice", "White", "burnice.white@gruasyequipos.com", "$argon2id$v=19$m=65536,t=3,p=4$uSdoZWPwREsGT30mYKhVYA$ccKbFQBxro7iz9HxzC0OtGksJtfB1sllMblBARKNUKQ", 1, 2, "32932813", "BESTOPiromanaCoctelera"), -- n1trofu3l2305!!
("Alice", "Thymefield", "alice.thymefield@gruasyequipos.com", "$argon2id$v=19$m=65536,t=3,p=4$RyGuvYgnu9w28Wk5DZL5xQ$69C1C1hFiEbuJIHv8XHmEr+WaSQJhSGEhmtSydL0+E0", 2, 2, "5559555", "Arenera"), -- simmetry.yrtemmis
("Nicole" ,"Demara", "nicole.demara@gruasyequipos.com", "$argon2id$v=19$m=65536,t=3,p=4$qGoGEAzV630r3IL5/6F6FQ$CT3vaIhtUdSfqyVuylaK1tCzQsxBYAIBhgkS4Kbo97Y", 2, 2, "4353231", "CunningHare#1"), -- deniqu3s4life
("Ellen" ,"Joe", "ellen.joe@gruasyequipos.com", "$argon2id$v=19$m=65536,t=3,p=4$Gus9KGYMewOEn/xNjDFggg$39zAtBxC57zJXiuX3JUQeUvTaPmL7Rm9tOEALxmC7vE", 2, 2, "2321423", "SharkNomi"), -- sl33pyshark
("Luciana Auxesis Theodoro" ,"De Montefio", "luciana.auxesis@gruasyequipos.com", "$argon2id$v=19$m=65536,t=3,p=4$aYCvHUmdUhheffI6C9Lz0A$TEMDOvtKfgTMgbA3yMCQtr2/9aRAwrll5ee5/G+gEuE", 1,2, "9823942", "HomeRUN!"); -- cal1don!! 

-- Stats
-- UPDATE `bd_bomberapp`.`estadisticas_usuarios` SET `monedas_estadistica` = '2000', `racha_estadistica` = '2', `xp_estadistica` = '5600' WHERE (`cod_estadistica` = '2') and (`cod_usuario` = '2');
-- UPDATE `bd_bomberapp`.`estadisticas_usuarios` SET `monedas_estadistica` = '1300', `racha_estadistica` = '99', `xp_estadistica` = '8000' WHERE (`cod_estadistica` = '3') and (`cod_usuario` = '3');

UPDATE estadisticas_usuarios eu
JOIN usuarios u ON u.cod_usuario = eu.cod_usuario
JOIN (
  /* nick,                coins,  racha, xp */
  SELECT 'ElAmorDeTuVida'       AS nick, 3000  AS coins,  50 AS racha,  9000  AS xp  /* Jane */
  UNION ALL SELECT 'BESTOPiromanaCoctelera',    5000,      150,        16000         /* Burnice: racha > Luciana */
  UNION ALL SELECT 'Arenera',                   3500,       80,        20000         /* Alice: mayor XP */
  UNION ALL SELECT 'CunningHare#1',            10000,       60,        14000         /* Nicole: mayor monedas */
  UNION ALL SELECT 'SharkNomi',                 2500,        0,         7000         /* Ellen: sin racha */
  UNION ALL SELECT 'HomeRUN!',                  8000,      140,        15000         /* Luciana: 2da en monedas, racha alta < Burnice */
) d ON d.nick = u.nickname_usuario
SET eu.monedas_estadistica = d.coins,
    eu.racha_estadistica   = d.racha,
    eu.xp_estadistica      = d.xp
WHERE u.cod_rol = 2;  -- solo operarias