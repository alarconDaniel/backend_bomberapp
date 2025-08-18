import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario';
import { Reto } from '../reto/reto';

@Entity('usuarios_retos')
export class UsuarioReto {
    @PrimaryGeneratedColumn({ name: 'cod_usuario_reto' })
    codUsuarioReto: number;

    @Column({ name: 'cod_usuario' })
    codUsuario: number;

    @Column({ name: 'cod_reto' })
    codReto: number;

    @Column({ type: 'enum', enum: ['asignado', 'en_progreso', 'abandonado', 'completado', 'vencido'] })
    estado: 'asignado' | 'en_progreso' | 'abandonado' | 'completado' | 'vencido';

    @Column({ name: 'fecha_complecion', type: 'date' })
    fechaComplecion!: string; // string 'YYYY-MM-DD'

    @Column({ name: 'empezado_en', type: 'date' })
    empezadoEn!: string; // string 'YYYY-MM-DD'

    @Column({ name: 'terminado_en', type: 'date' })
    terminadoEn!: string; // string 'YYYY-MM-DD'

    @Column({ name: 'tiempo_complecion_seg', type: 'int'})
    tiempoComplecionSegn!: number;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'cod_usuario', referencedColumnName: 'codUsuario' })
    usuario: Usuario;

    @ManyToOne(() => Reto)
    @JoinColumn({ name: 'cod_reto', referencedColumnName: 'codReto' })
    reto: Reto;
}
