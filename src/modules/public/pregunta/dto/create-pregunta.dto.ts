import { IsEnum, IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { TipoPregunta } from './../../../../models/pregunta/pregunta';

export class CreatePreguntaDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  numeroPregunta?: number; // si no llega, el service calcula MAX+1

  @IsString()
  enunciado!: string;

  @IsEnum(['abcd', 'rellenar', 'emparejar', 'reporte'] as const)
  tipo!: TipoPregunta;

  @IsInt()
  @Min(1)
  puntos!: number;

  @IsInt()
  @IsPositive()
  tiempoMax!: number;

  @IsInt()
  codReto!: number;
}
