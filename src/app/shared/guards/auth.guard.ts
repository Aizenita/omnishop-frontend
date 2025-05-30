import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
// map y take no son necesarios para la Opción 1
// import { map, take } from 'rxjs/operators'; 
import { AuthService } from '../services/auth.service'; // Ajusta la ruta si es necesario

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  
    console.log('AuthGuard: Ejecutándose...'); // <--- AÑADIR ESTA LÍNEA


  const authService = inject(AuthService);
  const router = inject(Router);

  // Opción 1: Usando el valor síncrono de isAuthenticated (más simple para CanActivateFn)
  if (authService.isAuthenticated()) {
    return true;
  } else {
    // Guardar la URL a la que se intentaba acceder para redirigir después del login
    const returnUrl = state.url;
    console.log('AuthGuard: Usuario no autenticado, redirigiendo a login con returnUrl:', returnUrl);
    return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
  }

  // Opción 2: Usando el Observable isAuthenticated$ (más reactivo si el estado pudiera cambiar durante la guarda)
  // return authService.isAuthenticated$.pipe(
  //   take(1), // Tomar solo el primer valor emitido para decidir
  //   map(isAuthenticated => {
  //     if (isAuthenticated) {
  //       return true;
  //     } else {
  //       const returnUrl = state.url;
  //       console.log('AuthGuard: Usuario no autenticado, redirigiendo a login con returnUrl:', returnUrl);
  //       return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
  //     }
  //   })
  // );
};
