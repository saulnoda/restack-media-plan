# Restack Media Plan - Contexto del Proyecto

## Descripción
Plan de medios interactivo para Restack - Servicios de migración SaaS. Calculadora de presupuesto con proyecciones ROI para LinkedIn, Google y Meta Ads.

## Stack Técnico
- React 18 + Vite
- CSS-in-JS (sin librerías externas)
- Nginx para producción

## Estructura
```
restack-media-plan/
├── App.jsx          # Componente principal (toda la lógica)
├── main.jsx         # Entry point React
├── index.html       # HTML base
├── vite.config.js   # Config Vite (base: /restack-media-plan/)
├── Dockerfile       # Build multi-stage
├── nginx.conf       # Config nginx local
└── docker-compose.yml
```

## URLs
- **Producción**: https://saulnoda.cloud/restack-media-plan/
- **Servidor**: VPS Hostinger (root@saulnoda.cloud)

## Comandos
```bash
npm run dev      # Desarrollo local
npm run build    # Build producción
```

---

### Sesion: 2026-01-03 10:30 UTC

**Completado:**
- Deploy completo en Hostinger VPS
- Instalacion de nginx en el servidor
- Configuracion de subdirectorio /restack-media-plan/
- SSL con Let's Encrypt (certbot)
- Redireccion HTTP a HTTPS

**Decisiones tecnicas:**
- Nginx como servidor web (no habia servidor instalado previamente)
- Certificado SSL gratuito con Let's Encrypt (expira 2026-04-03)
- Archivos estaticos servidos desde /var/www/restack-media-plan/

**Problemas encontrados:**
- El servidor no tenia nginx instalado: Se instalo apt install nginx
- No habia configuracion SSL: Se configuro certbot con renovacion automatica

**Proximos pasos:**
1. Monitorear renovacion automatica del certificado SSL
2. Considerar agregar analytics (GA4) al sitio
3. Posible mejora: agregar PWA para uso offline

**Contexto critico:**
- Servidor: root@saulnoda.cloud
- Archivos en: /var/www/restack-media-plan/
- Config nginx: /etc/nginx/sites-enabled/saulnoda.cloud
- Certificado SSL expira: 2026-04-03
