// src/models/archivo/archivo.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    Index,
  } from 'typeorm';
  import { Usuario } from '../usuario/usuario';
  
  @Entity({ name: 'archivos' })
  export class Archivo {
    @PrimaryGeneratedColumn({ name: 'cod_archivo', type: 'int' })
    codArchivo!: number;
  
    @Index()
    @Column({ name: 'path', type: 'varchar', length: 255, unique: true })
    path!: string;
  
    @Column({ name: 'nombre_original', type: 'varchar', length: 255 })
    nombreOriginal!: string;
  
    @Column({ name: 'content_type', type: 'varchar', length: 128 })
    contentType!: string;
  
    @Column({ name: 'size_bytes', type: 'bigint', default: 0 })
    sizeBytes!: number;
  
    @CreateDateColumn({ name: 'fecha_subida', type: 'timestamp' })
    fechaSubida!: Date;
  
    @ManyToOne(() => Usuario, (usuario) => usuario.archivos, { onDelete: 'CASCADE' })
    usuario!: Usuario;
  }
  