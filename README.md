# Mundial 2026

App móvil en español para seguir el Mundial 2026: grupos, partidos, bracket, estadísticas. Funciona 100% offline con datos locales y persistencia en `localStorage`.

## Tecnologías
- React + TypeScript + Vite
- Tailwind CSS
- Diseño mobile-first, tema oscuro con acentos rojo, verde y azul

## Desarrollo
```bash
npm install
npm run dev
```

## Build web
```bash
npm run build
```

## Generar APK para Android con Capacitor

> Requisitos: Node 18+, Java 17+, Android Studio con SDK instalado.

1. Instala dependencias y compila el web:
   ```bash
   npm install
   npm run build
   ```

2. Instala Capacitor:
   ```bash
   npm install @capacitor/core @capacitor/android
   npm install -D @capacitor/cli
   ```

3. Inicializa Capacitor (solo la primera vez):
   ```bash
   npx cap init "Mundial 2026" com.mundial2026.app --web-dir=dist
   ```

4. Agrega la plataforma Android:
   ```bash
   npx cap add android
   ```

5. Sincroniza los assets web a Android:
   ```bash
   npx cap sync android
   ```

6. Abre el proyecto en Android Studio:
   ```bash
   npx cap open android
   ```

7. En Android Studio:
   - `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - El APK quedará en `android/app/build/outputs/apk/debug/app-debug.apk`

8. Para un APK firmado de producción:
   - `Build` → `Generate Signed Bundle / APK` → `APK`
   - Sigue los pasos para crear o seleccionar el keystore.

Cada vez que cambies el código web:
```bash
npm run build && npx cap sync android
```
