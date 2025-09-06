import { IsInt, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateRespuestaPreguntaDto {
  @IsInt()
  codUsuarioReto!: number;

  @IsInt()
  codPregunta!: number;

  @IsOptional()
  valorJson?: any;

  @IsOptional()
  @IsBoolean()
  esCorrecta?: boolean;

  @IsOptional()
  @IsNumber()
  puntaje?: number;

  @IsOptional()
  @IsInt()
  tiempoSeg?: number;
}
