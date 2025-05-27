import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http'; // Importar HTTP_INTERCEPTORS
import { AuthInterceptor } from './shared/interceptors/auth.interceptor'; // Importar el interceptor
// Si 'routes' es necesario, asegúrate de que './app.routes' existe y se importa provideRouter
// import { provideRouter } from '@angular/router';
// import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // provideRouter(routes), // Si se usa routing, esta línea debería estar aquí
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
    provideHttpClient(), // Provee HttpClient
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // Añadir el interceptor
  ]
};
