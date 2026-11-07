import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegistroRequest, Usuario } from './models';

interface Sesion {
  token: string;
  expiraEn: number; // timestamp en ms
  usuario: Usuario;
}

const CLAVE_STORAGE = 'banco_sesion';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly url = `${environment.apiUrl}/auth`;

  private readonly sesion = signal<Sesion | null>(this.leerSesion());

  readonly usuario = computed(() => this.sesion()?.usuario ?? null);

  registrar(datos: RegistroRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/registro`, datos).pipe(tap((r) => this.guardar(r)));
  }

  login(datos: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/login`, datos).pipe(tap((r) => this.guardar(r)));
  }

  logout(motivo?: 'expirada'): void {
    this.sesion.set(null);
    localStorage.removeItem(CLAVE_STORAGE);
    this.router.navigate(['/login'], { queryParams: motivo ? { sesion: motivo } : {} });
  }

  /** Token vigente o null si no hay sesion o ya expiro. */
  token(): string | null {
    const s = this.sesion();
    if (!s) return null;
    if (Date.now() >= s.expiraEn) {
      this.sesion.set(null);
      localStorage.removeItem(CLAVE_STORAGE);
      return null;
    }
    return s.token;
  }

  estaAutenticado(): boolean {
    return this.token() !== null;
  }

  private guardar(r: AuthResponse): void {
    const sesion: Sesion = { token: r.token, expiraEn: Date.now() + r.expiraEnMs, usuario: r.usuario };
    this.sesion.set(sesion);
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(sesion));
  }

  private leerSesion(): Sesion | null {
    try {
      const raw = localStorage.getItem(CLAVE_STORAGE);
      if (!raw) return null;
      const s = JSON.parse(raw) as Sesion;
      return s.token && s.expiraEn > Date.now() ? s : null;
    } catch {
      return null;
    }
  }
}
