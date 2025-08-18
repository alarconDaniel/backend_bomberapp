// src/modules/public/usuario-reto/usuario-reto.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UsuarioReto } from 'src/models/usuario-reto/usuario-reto';

type EstadoDB = 'asignado' | 'en_progreso' | 'abandonado' | 'completado' | 'vencido';

@Injectable()
export class UsuarioRetoService {

    private repo: Repository<UsuarioReto>;
    
    constructor(private readonly ds: DataSource) {
        this.repo = this.ds.getRepository(UsuarioReto);
    }

    async listarMisRetos(codUsuario: number, estado?: 'pendiente' | EstadoDB) {
        const qb = this.repo.createQueryBuilder('ur')
            .innerJoinAndSelect('ur.reto', 'reto')
            .where('ur.codUsuario = :codUsuario', { codUsuario })
            .orderBy('reto.fechaInicioReto', 'ASC');

        if (estado) {
            if (estado === 'pendiente') {
                qb.andWhere('ur.estado IN (:...e)', { e: ['asignado', 'en_progreso'] as EstadoDB[] });
            } else {
                qb.andWhere('ur.estado = :e', { e: estado });
            }
        }

        const rows = await qb.getMany();
        return rows.map(r => ({
            codReto: r.reto.codReto,
            nombreReto: r.reto.nombreReto,
            descripcionReto: r.reto.descripcionReto,
            tiempoEstimadoSegReto: (r.reto as any).tiempoEstimadoSegReto ?? (r.reto as any).tiempoReto ?? 0,
            fechaInicioReto: r.reto.fechaInicioReto,
            fechaFinReto: r.reto.fechaFinReto,
            estado: r.estado,
            completado: r.estado === 'completado',
            enProgreso: r.estado === 'en_progreso',
        }));
    }

    async resumenMisRetos(codUsuario: number) {
        const base: Record<EstadoDB, number> = { asignado: 0, en_progreso: 0, abandonado: 0, completado: 0, vencido: 0 };
        const rows = await this.repo.createQueryBuilder('ur')
            .select('ur.estado', 'estado')
            .addSelect('COUNT(*)', 'total')
            .where('ur.codUsuario = :codUsuario', { codUsuario })
            .groupBy('ur.estado')
            .getRawMany<{ estado: EstadoDB; total: string }>();

        for (const r of rows) base[r.estado] = Number(r.total);
        return { ...base, pendiente: base.asignado + base.en_progreso, total: Object.values(base).reduce((a, b) => a + b, 0) };
    }

    // útil para avanzar flujo
    async marcarEstado(codUsuario: number, codReto: number, estado: EstadoDB) {
        await this.repo.createQueryBuilder()
            .update(UsuarioReto)
            .set({ estado })
            .where('codUsuario = :codUsuario AND codReto = :codReto', { codUsuario, codReto })
            .execute();
        return { ok: true };
    }
}
