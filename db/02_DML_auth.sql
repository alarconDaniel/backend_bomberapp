USE bd_auth;
INSERT INTO roles(nombre_rol) VALUES ("admin"),("operario");

INSERT INTO usuarios(nombre_usuario, apellido_usuario, correo_usuario, contrasena_usuario, cod_rol, cedula_usuario, nickname_usuario)
VALUES
-- Administradora
("Hoshimi", "Miyabi", "hoshimi.miyabi@gruasyequipos.com", "$argon2id$v=19$m=65536,t=3,p=4$OaUtNOb7FLxaH6yCqoqjeQ$c5fPMkcG176kD/rj9P4Zaq/KBphbGnSdQdPr//RFLO4", 1, "77415156123", NULL), -- wat3rm3l0n014

-- Operarias
("Jane", "Doe", "jane.doe@gruasyequipos.com", "$argon2id$v=19$m=65536,t=3,p=4$cb7GY5gq0h6G6eDXCZCABQ$MZVidZHtAnh1Kll26Tfeb8ZfDGI1+Q93zbuaGQ63Wg8", 2, "81932143", "ElAmorDeTuVida"), -- satrex1602
("Burnice", "White", "burnice.white@gruasyequipos.com", "$argon2id$v=19$m=65536,t=3,p=4$uSdoZWPwREsGT30mYKhVYA$ccKbFQBxro7iz9HxzC0OtGksJtfB1sllMblBARKNUKQ", 2, "32932813", "BESTOPiromanaCoctelera"), -- n1trofu3l2305!!
("Alice", "Thymefield", "alice.thymefield@gruasyequipos.com", "$argon2id$v=19$m=65536,t=3,p=4$RyGuvYgnu9w28Wk5DZL5xQ$69C1C1hFiEbuJIHv8XHmEr+WaSQJhSGEhmtSydL0+E0", 2, "5559555", "Arenera"), -- simmetry.yrtemmis
("Nicole" ,"Demara", "nicole.demara@gruasyequipos.com", "$argon2id$v=19$m=65536,t=3,p=4$qGoGEAzV630r3IL5/6F6FQ$CT3vaIhtUdSfqyVuylaK1tCzQsxBYAIBhgkS4Kbo97Y", 2, "4353231", "CunningHare#1"), -- deniqu3s4life
("Ellen" ,"Joe", "ellen.joe@gruasyequipos.com", "$argon2id$v=19$m=65536,t=3,p=4$Gus9KGYMewOEn/xNjDFggg$39zAtBxC57zJXiuX3JUQeUvTaPmL7Rm9tOEALxmC7vE", 2, "2321423", "SharkNomi"), -- sl33pyshark
("Luciana Auxesis Theodoro" ,"De Montefio", "luciana.auxesis@gruasyequipos.com", "$argon2id$v=19$m=65536,t=3,p=4$aYCvHUmdUhheffI6C9Lz0A$TEMDOvtKfgTMgbA3yMCQtr2/9aRAwrll5ee5/G+gEuE",2, "9823942", "HomeRUN!"); -- cal1don!! 
