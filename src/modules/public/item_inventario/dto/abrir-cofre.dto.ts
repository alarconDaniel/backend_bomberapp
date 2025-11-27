// src/modules/public/item_inventario/dto/abrir-cofre.dto.ts
// DTO para la acción de abrir un cofre desde el inventario del usuario.
// Valida que se reciba un identificador numérico y positivo de ItemInventario.
import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AbrirCofreDto {
  @ApiProperty({
    description: 'Identificador del item en inventario que representa el cofre a abrir.',
    example: 42,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  codItemInventario!: number;
}
