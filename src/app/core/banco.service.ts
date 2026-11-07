import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Beneficiario,
  BeneficiarioRequest,
  Cuenta,
  OperacionRequest,
  TipoCuenta,
  Transaccion,
  TransferenciaRequest,
} from './models';

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

  beneficiarios(): Observable<Beneficiario[]> {
    return this.http.get<Beneficiario[]>(`${this.api}/beneficiarios`);
  }

  inscribirBeneficiario(req: BeneficiarioRequest): Observable<Beneficiario> {
    return this.http.post<Beneficiario>(`${this.api}/beneficiarios`, req);
  }

  eliminarBeneficiario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/beneficiarios/${id}`);
  }
}
