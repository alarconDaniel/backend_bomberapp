// src/db/entities/estadistica-usuario/EstadisticaUsuario.ts
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Index,
  RelationId,
} from 'typeorm';
import { Usuario } from '../usuario/usuario';

@Entity({ name: 'estadisticas_usuarios' })
// Tabla de estadísticas agregadas por usuario (xp, monedas, racha, etc.)
export class EstadisticaUsuario {
  // Parte 1 de la PK (AUTO_INCREMENT interno de la tabla de estadísticas)
  @PrimaryGeneratedColumn({ name: 'cod_estadistica', type: 'int' })
  codEstadistica!: number;

  // Cantidad total de monedas acumuladas por el usuario
  @Column({ name: 'monedas_estadistica', type: 'int', default: 0 })
  monedas!: number;

  // Racha actual de días/retos completados (según tu lógica de racha)
  @Column({ name: 'racha_estadistica', type: 'int', default: 0 })
  racha!: number;

  @Column({
    name: 'xp_estadistica',
    type: 'int',
    default: 0,
    comment:
      'La experiencia total con la que cuenta el usuario; niveles se calculan en el backend',
  })
  xp!: number;

  // Parte 2 de la “identidad” lógica: relación 1-1 con Usuario vía cod_usuario
  // Nota: no definimos @Column separado; el JoinColumn crea la columna 'cod_usuario'.
  @OneToOne(() => Usuario, (u) => u.estadisticas, {
    eager: true, // carga el usuario junto con las estadísticas (cómodo para dashboards)
    nullable: false, // si en algún momento quieres permitir estadísticas huérfanas, cámbialo a true
    onDelete: 'CASCADE', // si se borra el usuario, se borran sus estadísticas
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'cod_usuario', referencedColumnName: 'codUsuario' })
  @Index('fk_estadisticas_usuario_usuarios1') // índice para la FK hacia usuarios
  usuario!: Usuario;

  // Acceso directo al id del usuario sin necesidad de cargar el objeto completo
  @RelationId((e: EstadisticaUsuario) => e.usuario)
  codUsuario!: number;
}
