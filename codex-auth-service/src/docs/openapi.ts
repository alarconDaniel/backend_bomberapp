export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Bomberapp Auth Service',
    version: '1.0.0',
    description:
      'Contratos REST del microservicio de autenticación para Bomberapp. '
      + 'Úsalo desde el API Gateway para iniciar sesión, refrescar tokens y gestionar reinicios de contraseña.',
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
      },
      TokenResponse: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              email: { type: 'string', format: 'email' },
              role: { type: 'string' },
            },
          },
          access_token: { type: 'string' },
          refresh_token: { type: 'string' },
          expires_in: { type: 'string', description: 'TTL del access token (ej. 15m)' },
          refresh_expires_in: { type: 'string', description: 'TTL del refresh token (ej. 7d)' },
        },
      },
      RefreshRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['token', 'newPassword'],
        properties: {
          token: { type: 'string' },
          newPassword: { type: 'string', minLength: 6 },
        },
      },
      LogoutRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      GenericOk: {
        type: 'object',
        properties: {
          ok: { type: 'boolean', default: true },
        },
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        summary: 'Iniciar sesión de usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Inicio de sesión exitoso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TokenResponse' },
              },
            },
          },
          '401': { description: 'Credenciales inválidas' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        summary: 'Rotar un refresh token válido',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Tokens actualizados',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TokenResponse' },
              },
            },
          },
          '401': { description: 'Refresh inválido' },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Obtener datos del usuario autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Payload JWT validado',
          },
          '401': { description: 'Token inválido o ausente' },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        summary: 'Solicitar token de reinicio de contraseña',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ForgotPasswordRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Token generado (en dev se devuelve en el cuerpo)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean' },
                    token: { type: 'string' },
                    expiresAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        summary: 'Restablecer contraseña usando token válido',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ResetPasswordRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Contraseña actualizada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GenericOk' },
              },
            },
          },
          '400': { description: 'Token expirado o inválido' },
        },
      },
    },
    '/auth/logout': {
      post: {
        summary: 'Cerrar sesión y anular refresh token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LogoutRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Refresh invalidado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GenericOk' },
              },
            },
          },
        },
      },
    },
  },
} as const;
