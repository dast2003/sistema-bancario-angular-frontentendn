import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cuenta, OperacionRequest, TipoCuenta, Transaccion, TransferenciaRequest } from './models';

@Injectable({ providedIn: 'root' })
export class BancoService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  misCuentas(): Observable<Cuenta[]> {
    return this.http.get<Cuenta[]>(`${this.api}/cuentas`);
  }

  abrirCuenta(tipo: TipoCuenta): Observable<Cuenta> {
    return this.http.post<Cuenta>(`${this.api}/cuentas`, { tipo });
  }

  depositar(numero: string, req: OperacionRequest): Observable<Transaccion> {
    return this.http.post<Transaccion>(`${this.api}/cuentas/${numero}/depositos`, req);
  }

  retirar(numero: string, req: OperacionRequest): Observable<Transaccion> {
    return this.http.post<Transaccion>(`${this.api}/cuentas/${numero}/retiros`, req);
  }

  transferir(req: TransferenciaRequest): Observable<Transaccion> {
    return this.http.post<Transaccion>(`${this.api}/transferencias`, req);
  }

  movimientos(numero: string): Observable<Transaccion[]> {
    return this.http.get<Transaccion[]>(`${this.api}/cuentas/${numero}/movimientos`);
  }
}
