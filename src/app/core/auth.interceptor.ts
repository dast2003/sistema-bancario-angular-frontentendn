import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

/**
 * Agrega "Authorization: Bearer <token>" a las llamadas al backend.
 * Si el backend responde 401 en una ruta protegida, la sesion expiro: se cierra y se va al login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const esApi = req.url.startsWith(environment.apiUrl);
  const esAuth = req.url.startsWith(`${environment.apiUrl}/auth/`);
  const token = auth.token();

  const peticion = esApi && !esAuth && token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(peticion).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401 && esApi && !esAuth) {
        auth.logout('expirada');
      }
      return throwError(() => err);
    }),
  );
};
