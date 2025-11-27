import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'logros' })
export class Logro {
  // PK del logro (ej: 1 = "Primer encendido", 2 = "Bandera al viento")
  @PrimaryGeneratedColumn({ name: 'cod_logro', type: 'int' })
  codLogro!: number;

  // Nombre corto y visible del logro (ej: "¡Racha 30!", "Cofre abierto", "Velocista")
  @Column({ name: 'nombre_logro', type: 'varchar', length: 255 })
  nombreLogro!: string;

  // Descripción que ve el usuario en la ficha del logro (tono narrativo/gamificado)
  @Column({ name: 'descripcion_logro', type: 'mediumtext' })
  descripcionLogro!: string;

  // Ruta o nombre del icono en el frontend (ej: '/static/icons/logros/primer-encendido.svg')
  @Column({ name: 'icono_logro', type: 'varchar', length: 255 })
  iconoLogro!: string;

  // Recompensa asociada en texto legible (ej: '+50 XP', '400 monedas + 150 XP')
  // La interpretación real de la recompensa se hace en la lógica de negocio.
  @Column({ name: 'recompensa_logro', type: 'varchar', length: 255 })
  recompensaLogro!: string;
}
