import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

// Interfaces will be defined at the end of the file as per the prompt

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth'; // El proxy se encargará de la URL base
  private readonly TOKEN_KEY = 'authToken';
  private readonly ROLE_KEY = 'authRole'; // Kept for potential direct role storage, though UserIdentity is preferred
  private readonly USER_INFO_KEY = 'authUser'; // Para UserIdentity

  private currentUserSubject = new BehaviorSubject<UserIdentity | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(!!this.getToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    // Si hay un token al iniciar y no hay UserIdentity, se podría validar con el endpoint /me.
    // Si hay UserIdentity, asumimos que el token es válido para esa identidad hasta que una petición falle.
    // Esta lógica se ha movido/refinado en la versión del prompt más reciente
    // if (this.getToken() && !this.getCurrentUser()) {
    //     this.fetchAndSetCurrentUser().subscribe({
    //         error: (err) => console.error("Failed to fetch current user on init", err)
    //     });
    // }
    // La inicialización de currentUserSubject y isAuthenticatedSubject ya maneja la carga desde localStorage.
    // Si se necesita una validación activa del token al inicio, se puede agregar una llamada a fetchAndSetCurrentUser aquí,
    // pero se debe manejar con cuidado para no bloquear la app o hacer llamadas innecesarias.
  }

  login(credentials: AuthRequest): Observable<AuthResponse> {
    // Lógica HTTP se implementará en el siguiente paso
    // Ejemplo de cómo se verá:
    // return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
    //   tap(response => this.setSession(response)), // Asumimos que el login también devuelve UserIdentity o lo obtenemos después
    //   catchError(this.handleError)
    // );
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // setSession se encargará de guardar el token y luego llamar a fetchAndSetCurrentUser
        this.setSession(response); 
      }),
      catchError(this.handleError) // Manejo de errores centralizado
    );
  }

  register(userInfo: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userInfo).pipe(
      tap(response => {
        // setSession se encargará de guardar el token y luego llamar a fetchAndSetCurrentUser
        this.setSession(response);
      }),
      catchError(this.handleError) // Manejo de errores centralizado
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido.';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de red
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // El backend devolvió un código de error.
      // El cuerpo de la respuesta puede contener pistas sobre qué salió mal.
      console.error(
        `Backend retornó código ${error.status}, ` +
        `cuerpo del error fue:`, error.error);
      
      // Intenta extraer el mensaje de error específico de tu GlobalExceptionHandler
      if (error.error && typeof error.error === 'object' && error.error.error) {
        errorMessage = `Error: ${error.error.error}`; // Para errores como { "error": "Credenciales inválidas" }
      } else if (typeof error.error === 'string') {
        errorMessage = error.error; // Si el backend devuelve directamente un string de error
      } else {
        errorMessage = `Error ${error.status}: ${error.statusText}. Por favor, inténtalo de nuevo más tarde.`;
      }
    }
    console.error(errorMessage); // Log para el desarrollador
    return throwError(() => new Error(errorMessage)); // Propagar un error que el componente pueda manejar
  }

  fetchAndSetCurrentUser(): Observable<UserIdentity | null> {
    if (!this.getToken()) {
      // No hay token, no se puede obtener el usuario. Asegurarse de que la sesión esté limpia.
      this.setCurrentUser(null); // Esto limpia USER_INFO_KEY y actualiza currentUserSubject
      this.isAuthenticatedSubject.next(false); // Asegurar que el estado de autenticación sea falso
      return of(null);
    }
    return this.http.get<UserIdentity>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        this.setCurrentUser(user);
        // Sincronizar el estado de autenticación basado en una respuesta exitosa de /me
        this.isAuthenticatedSubject.next(true);
        // Opcionalmente, también se puede actualizar ROLE_KEY si aún se usa
        if (user && user.rol) {
            localStorage.setItem(this.ROLE_KEY, user.rol);
        }
      }),
      catchError(error => {
        console.error('Failed to fetch current user:', error);
        this.logout(); // Si falla /me, el token es inválido o el backend no está disponible
        return of(null); // Devolver null para indicar que no se pudo obtener el usuario
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.USER_INFO_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    // Podría necesitarse redirigir con Router aquí o en el componente que llama a logout
    console.log('AuthService: logout successful');
  }

  getToken(): string | null {
    // Asegurar que esto funcione en SSR/Node.js donde localStorage no está disponible
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserRole(): string | null {
    const user = this.currentUserSubject.value;
    // Fallback a ROLE_KEY si el usuario no está en currentUserSubject o si se necesita un acceso síncrono
    // y no se quiere depender del observable. Sin embargo, la fuente de verdad debería ser currentUserSubject.
    return user ? user.rol : (typeof localStorage !== 'undefined' ? localStorage.getItem(this.ROLE_KEY) : null);
  }
  
  getCurrentUser(): UserIdentity | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    // La autenticación se basa en el estado del BehaviorSubject, que se actualiza
    // al iniciar, al hacer login/logout, y al validar el token con /me.
    // También se puede agregar una comprobación de token por si acaso, aunque debería ser consistente.
    return this.isAuthenticatedSubject.value && !!this.getToken();
  }

  // Este método será llamado por login/register tras una respuesta exitosa
  public setSession(authResponse: AuthResponse, user?: UserIdentity): void {
    localStorage.setItem(this.TOKEN_KEY, authResponse.token);
    // El rol de authResponse.rol podría ser un rol general, UserIdentity.rol es más específico.
    // Si user.rol existe, es el que se debe usar para USER_INFO_KEY y ROLE_KEY.
    if (authResponse.rol && (!user || !user.rol)) {
        localStorage.setItem(this.ROLE_KEY, authResponse.rol);
    }

    if (user) {
        this.setCurrentUser(user);
        if (user.rol) { // Si el usuario tiene un rol, asegurarse que ROLE_KEY está sincronizado
            localStorage.setItem(this.ROLE_KEY, user.rol);
        }
        this.isAuthenticatedSubject.next(true); // Usuario proporcionado, sesión activa
    } else {
        // Si no se proporciona 'user' explícitamente, intentar obtenerlo.
        // Esto es útil si el endpoint de login/registro solo devuelve el token.
        this.fetchAndSetCurrentUser().subscribe({
            next: (fetchedUser) => {
                if (!fetchedUser) {
                    // Si fetchAndSetCurrentUser devuelve null (ej. error en /me),
                    // podría ser una señal de que el token no es válido.
                    // Considerar si se debe limpiar la sesión aquí o manejarlo en fetchAndSetCurrentUser.
                    // Por ahora, fetchAndSetCurrentUser ya llama a logout() en error.
                    this.isAuthenticatedSubject.next(false); // Asegurar que no se quede como autenticado
                }
                // isAuthenticatedSubject ya se actualiza en fetchAndSetCurrentUser
            },
            error: (err) => {
                console.error("Error fetching user identity after setting session with token only", err);
                this.isAuthenticatedSubject.next(false); // Error al obtener usuario, no autenticado
            }
        }); 
    }
    // Nota: isAuthenticatedSubject se establece en true si 'user' se pasa o si fetchAndSetCurrentUser tiene éxito.
    // Si fetchAndSetCurrentUser falla, se establece en false dentro de su lógica de error/éxito.
  }
  
  private setCurrentUser(user: UserIdentity | null): void {
    if (user) {
        localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(this.USER_INFO_KEY);
    }
    this.currentUserSubject.next(user); // Actualizar el BehaviorSubject
  }

  private getUserFromStorage(): UserIdentity | null {
    if (typeof localStorage === 'undefined') return null; // Guard for SSR or specific environments
    const userJson = localStorage.getItem(this.USER_INFO_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (e) {
        console.error("Error parsing user from storage", e);
        localStorage.removeItem(this.USER_INFO_KEY); // Limpiar si está corrupto
        return null;
      }
    }
    return null;
  }
  
  // private clearSession(): void { // Ya implementado en el prompt (logout)
  //   localStorage.removeItem(this.TOKEN_KEY);
  //   localStorage.removeItem(this.ROLE_KEY);
  //   localStorage.removeItem(this.USER_INFO_KEY);
  //   this.currentUserSubject.next(null);
  //   this.isAuthenticatedSubject.next(false);
  // }

  // private loadSession(): void { // La lógica de carga ya está en la inicialización de BehaviorSubjects
  //   // Esta función no es necesaria si los BehaviorSubjects se inicializan directamente
  //   // desde localStorage como se está haciendo.
  // }

  // private handleError(error: HttpErrorResponse) {
  //   // Implementación del manejo de errores se hará después
  //   console.error('API Error:', error);
  //   return throwError(() => new Error('Something bad happened; please try again later.'));
  // }
}

// --- Interfaces ---

export interface AuthRequest {
  email: string;
  password?: string; // Password es opcional si se usa para otros flujos, pero requerido para login
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  rol: string; // El rol puede venir en la respuesta de login/registro o ser parte de UserIdentity
}

export interface UserIdentity {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}
