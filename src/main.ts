import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Carga las credenciales de GCP desde la variable de entorno base64
 * y las deja disponibles en un archivo runtime para los SDKs.
 */
function ensureGcpCreds() {
  const b64 = process.env.GCP_SA_KEY_B64;
  if (!b64) return;
  const jsonStr = Buffer.from(b64, 'base64').toString('utf8');
  const credPath = './secrets/gcp-key.runtime.json';
  if (!existsSync(dirname(credPath))) mkdirSync(dirname(credPath), { recursive: true });
  writeFileSync(credPath, jsonStr, { encoding: 'utf8' });
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;
}
ensureGcpCreds();

/**
 * Punto de entrada del servidor NestJS.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Parsers y Límites (Es mejor definirlos antes del Swagger y Listen)
  app.use(json({ limit: '15mb' }));
  app.use(urlencoded({ extended: true, limit: '15mb' }));

  // 2. Validaciones Globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // 3. Filtros de Excepción
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS (Descomentar si es necesario)
  // app.enableCors({
  //   origin: (_origin, cb) => cb(null, true),
  //   methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  //   credentials: true,
  // });

  const puerto = Number(process.env.PUERTO_SERVIDOR) || 3000;

  // --- CONFIGURACIÓN VISUAL DE SWAGGER ---
  const description = `
<div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; line-height: 1.6; font-size: 0.85rem">
<div style="margin-bottom: 20px;">
  Bienvenido a la documentación oficial de la <b>API BomberApp</b> que funciona como servidor en la aplicación BomberApp. 
  Esta plataforma impulsa la estrategia de gamificación para <span style="color: #d97706; font-weight: bold;">Grúas y Equipos</span>.
</div>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 25px;">
  
<div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border-top: 5px solid #0f172a; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <h4 style="margin-top: 0; color: #0f172a; display: flex; align-items: center; gap: 8px;">
      🛡️ Seguridad
    </h4>
<ul style="padding-left: 20px; margin: 0; color: #475569;">
      <li>Autenticación JWT</li>
      <li>Cifrado Argon2id</li>
      <li>Protección de rutas</li>
</ul>
</div>

<div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border-top: 5px solid #d97706; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <h4 style="margin-top: 0; color: #d97706; display: flex; align-items: center; gap: 8px;">
      🏆 Gamificación
    </h4>
    <ul style="padding-left: 20px; margin: 0; color: #475569;">
      <li>Retos diarios con calendario </li>
    <li>Sistema de Trofeos</li>
      <li>Ranking Operativo</li>
      <li>Marketplace</li>
    </ul>
</div>

<div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border-top: 5px solid #10b981; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <h4 style="margin-top: 0; color: #059669; display: flex; align-items: center; gap: 8px;">
      📂 Operativa
    </h4>
    <ul style="padding-left: 20px; margin: 0; color: #475569;">
      <li>Carga de archivos</li>
      <li>Auditoría</li>
      <li>Automatización</li>
    </ul>
  </div>
</div>

<div style="background: #f1f5f9; padding: 10px 15px; margin-top: 20px; border-radius: 6px; font-size: 0.85rem; border-left: 4px solid #cbd5e1;">
<strong>MVP Hackathon FIS 2025:</strong> Trazabilidad, motivación y estándares IEEE 830.
</div>
</div>`;

  // B. Configuración del DocumentBuilder
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SERVIDOR BOMBER-APP')
    .setDescription(description)
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingrese su Token de acceso',
      },
      'access-token',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  // C. CSS Personalizado (Estilo Clean Professional)
  const customCss = `
    /* Importar fuente limpia y profesional */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

    /* --- GLOBAL --- */
    body, .swagger-ui {
      background-color: #f8fafc !important; /* Gris muy claro */
      font-family: 'Inter', sans-serif !important;
      color: #334155 !important;
    }

    /* --- TOPBAR (Barra Superior) --- */
    .swagger-ui .topbar {
      background-color: #ffffff !important;
      border-bottom: 4px solid #FACC15;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      padding: 10px 0;
    }

    /* Ocultar logo por defecto de Swagger */
    .swagger-ui .topbar-wrapper a svg {
      display: none;
    }

    /* LOGO GRÚAS Y EQUIPOS */
    .swagger-ui .topbar-wrapper a {
      display: block;
      background-image: url('https://gruasyequipos.net/wp-content/uploads/2023/06/logo_Gruas__Equipos_fondo_oscuro_sin_tiempo_perdido-2048x1329.png');
      background-repeat: no-repeat;
      background-size: contain;
      background-position: center;
      width: 180px; 
      height: 50px;
      /* Fondo oscuro suave para que el logo blanco resalte */
      background-color: #1e293b;
      border-radius: 6px;
      padding: 5px 10px;
    }

    /* --- HEADER DE INFORMACIÓN --- */
    .swagger-ui .info .title {
      font-weight: 800;
      color: #1e293b !important;
      font-size: 2.2rem;
      letter-spacing: -0.5px;
    }
    
    .swagger-ui .info .title span { display: none; }
    .swagger-ui .info { margin-top: 20px; margin-bottom: 20px;}

    /* Enlaces */
    .swagger-ui .info a {
      color: #d97706 !important;
      font-weight: 600;
    }

    /* ******************************************************************* */
    /* *** CORRECCIÓN: Estilo de lista de alta especificidad (ul/li) *** */
    /* ******************************************************************* */
    /* Fuerza el tamaño de fuente y color a los elementos de lista dentro del panel de info (descripción) */
    .swagger-ui .info li {
      font-size: 0.95rem !important; 
      color: #475569 !important;
      margin-bottom: 5px !important; /* Pequeño espacio entre items para legibilidad */
    }

    /* --- BLOQUES DE ENDPOINTS (Tarjetas) - MEJORADO --- */
    .swagger-ui .opblock {
      background: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 8px !important;
      /* Sombra más marcada al bloque */
      box-shadow: 0 4px 8px rgba(0,0,0,0.04) !important;
      margin-bottom: 20px;
      transition: box-shadow 0.3s ease-in-out;
    }

    .swagger-ui .opblock:hover {
      box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
    }

    /* Colores barra lateral y borde inferior */
    .swagger-ui .opblock.opblock-get { border-left: 5px solid #3b82f6 !important; border-bottom: 2px solid #eff6ff; }
    .swagger-ui .opblock.opblock-post { border-left: 5px solid #10b981 !important; border-bottom: 2px solid #ecfdf5; }
    .swagger-ui .opblock.opblock-put { border-left: 5px solid #f59e0b !important; border-bottom: 2px solid #fffdf2; }
    .swagger-ui .opblock.opblock-delete { border-left: 5px solid #ef4444 !important; border-bottom: 2px solid #fef2f2; }
    /* Nuevo: PATCH */
    .swagger-ui .opblock.opblock-patch { border-left: 5px solid #fbbf24 !important; border-bottom: 2px solid #fffbeb; }


    /* Resumen del endpoint (Fondo para resaltar el método) */
    .swagger-ui .opblock .opblock-summary {
      padding: 12px;
      background-color: #fcfcfd; /* Fondo muy sutil para el área del resumen */
      border-radius: 8px 8px 0 0;
    }

    /* Colores de método como "Badge" */
    .swagger-ui .opblock .opblock-summary-method {
      border-radius: 4px;
      font-weight: 700;
      font-size: 11px;
      padding: 4px 10px;
      min-width: 70px;
      text-shadow: none;
      
      /* Reset general */
      background: none !important;
      color: #fff !important;
    }

    /* Métodos con colores específicos y fondo opaco (estilo de badge) */
    .swagger-ui .opblock.opblock-get .opblock-summary-method { background-color: #3b82f6 !important; }
    .swagger-ui .opblock.opblock-post .opblock-summary-method { background-color: #10b981 !important; }
    .swagger-ui .opblock.opblock-put .opblock-summary-method { background-color: #f59e0b !important; }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method { background-color: #ef4444 !important; }
    .swagger-ui .opblock.opblock-patch .opblock-summary-method { background-color: #fbbf24 !important; color: #1e293b !important; } /* Color de texto oscuro para el PATCH */

    .swagger-ui .opblock .opblock-summary-path {
      font-family: 'Consolas', monospace;
      font-size: 15px;
      color: #1e293b !important; /* Más oscuro para mejor contraste */
      font-weight: 600;
    }
    
    .swagger-ui .opblock .opblock-summary-description {
      color: #64748b !important; /* Más oscuro para mejor legibilidad */
      font-size: 13px;
    }

    /* --- BOTÓN AUTHORIZE --- */
    .swagger-ui .btn.authorize {
      background-color: #43fa15ff !important;
      color: #000 !important;
      border-color: #15fa28ff !important;
      font-weight: 700;
      text-transform: uppercase;
      border-radius: 4px;
    }
    .swagger-ui .btn.authorize svg { fill: #000 !important; }

    /* --- SCHEMAS --- */
    .swagger-ui section.models {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #ffffff;
      padding: 15px;
    }
    
    .swagger-ui section.models h4 {
      color: #1e293b !important;
      font-size: 1.2rem;
    }
  `;

  SwaggerModule.setup('/docs', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customCss: customCss,
    customSiteTitle: 'BomberApp API | Grúas y Equipos',
    customfavIcon: 'https://gruasyequipos.net/wp-content/uploads/2023/06/cropped-logo-gruas-y-quipos-1-32x32.jpg',
  });

  // Health check
  const http = app.getHttpAdapter().getInstance();
  http.get(`/api/health`, (_req: any, res: any) =>
    res.json({ ok: true, ts: new Date().toISOString() })
  );

  await app.listen(puerto, () => {
    console.log("Servidor funcionando en el puerto: " + puerto);
    console.log(`🚀 API http://localhost:${puerto}`);
    console.log(`📜 Swagger: http://localhost:${puerto}/docs`);
  });
}
bootstrap();