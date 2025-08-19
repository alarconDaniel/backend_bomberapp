import { Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'cod_usuario', type: 'integer' })
  public codUsuario: number;

  @Column({ name: 'nombre_usuario', type: 'varchar', length: 255, nullable: false })
  public nombreUsuario: string;

  @Column({ name: 'apellido_usuario', type: 'varchar', length: 255, nullable: false })
  public apellidoUsuario: string;

  @Column({ name: 'correo_usuario', type: 'varchar', length: 255, nullable: false })
  public correoUsuario: string; 

  @Column({ name: 'contrasena_usuario', type: 'varchar', length: 255, nullable: false })
  public contrasenaUsuario: string;

  @Column({ name: 'cargo_usuario', type: 'varchar', length: 255, nullable: false })
  public cargoUsuario: string;

  @Column({ name: 'cod_rol', type: 'integer', nullable: false, default: 2 })
  public codRol: number;

  constructor(
    cod?: number,
    nombre?: string,
    apellido?: string,
    correo?: string,
    contrasena?: string,
    cargo?: string,
    rol?: number,
  ) {
    if (cod !== undefined) this.codUsuario = cod;
    if (nombre !== undefined) this.nombreUsuario = nombre;
    if (apellido !== undefined) this.apellidoUsuario = apellido;
    if (correo !== undefined) this.correoUsuario = correo;
    if (contrasena !== undefined) this.contrasenaUsuario = contrasena;
    if (cargo !== undefined) this.cargoUsuario = cargo;
    this.codRol = rol ?? 2;
  }
}
