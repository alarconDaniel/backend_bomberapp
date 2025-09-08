import { IsInt, IsOptional } from 'class-validator';

export class CreateRespuestaFormularioDto {
  @IsInt()
  codUsuarioReto!: number;

  @IsInt()
  codReto!: number;

  data!: any;

  @IsOptional()
  terminadoEn?: Date | null;
}
