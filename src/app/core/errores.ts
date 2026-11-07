import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from './models';

/** Convierte un error HTTP del backend en un mensaje legible para la persona. */
export function mensajeError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que el backend este encendido en el puerto 8080.';
    }
    const body = err.error as ApiError | null;
    const detalles = body?.detalles ? Object.values(body.detalles) : [];
    if (detalles.length) return detalles.join('. ');
    if (body?.mensaje) return body.mensaje;
  }
  return 'Ocurrio un error inesperado. Intenta de nuevo.';
}
