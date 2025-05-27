import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Ajusta la ruta si es necesario

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.authService.getToken();

    // Clona la petición para añadir la nueva cabecera.
    // Solo añade el token si existe y si la petición no es a los endpoints de auth (login/register)
    // o a otros endpoints públicos que no requieran token.
    // Para simplificar por ahora, lo añadiremos a todas las peticiones si el token existe.
    // Una lógica más avanzada podría excluir ciertas URLs.
    if (authToken && !req.url.includes('/api/auth/login') && !req.url.includes('/api/auth/register')) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
      return next.handle(authReq);
    }

    // Envía la petición original si no hay token o es una URL de autenticación.
    return next.handle(req);
  }
}
