import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtAccessStrategy } from './jwt-access.strategy';
import { JWT_VERIFIER_OPTIONS } from './constants';
import {
  JwtVerifierModuleAsyncOptions,
  JwtVerifierModuleOptions,
} from './interfaces/jwt-verifier-module-options.interface';

@Module({})
export class JwtVerifierModule {
  static register(options: JwtVerifierModuleOptions): DynamicModule {
    return {
      module: JwtVerifierModule,
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      providers: [
        { provide: JWT_VERIFIER_OPTIONS, useValue: options },
        JwtAccessStrategy,
        JwtAuthGuard,
      ],
      exports: [PassportModule, JwtAccessStrategy, JwtAuthGuard],
    };
  }

  static registerAsync(options: JwtVerifierModuleAsyncOptions): DynamicModule {
    return {
      module: JwtVerifierModule,
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        ...(options.imports ?? []),
      ],
      providers: [...this.createAsyncProviders(options), JwtAccessStrategy, JwtAuthGuard],
      exports: [PassportModule, JwtAccessStrategy, JwtAuthGuard],
    };
  }

  private static createAsyncProviders(options: JwtVerifierModuleAsyncOptions) {
    if (!options.useFactory) {
      throw new Error('JwtVerifierModule.registerAsync requiere useFactory');
    }

    return [
      {
        provide: JWT_VERIFIER_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      },
    ];
  }
}
