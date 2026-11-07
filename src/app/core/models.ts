// Contratos de la API (coinciden con los DTO del backend)

export type TipoCuenta = 'AHORROS' | 'CORRIENTE';
export type TipoTransaccion = 'DEPOSITO' | 'RETIRO' | 'TRANSFERENCIA_ENVIADA' | 'TRANSFERENCIA_RECIBIDA';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  email: string;
  rol: 'CLIENTE' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  tipo: string;
  expiraEnMs: number;
  usuario: Usuario;
}

export interface RegistroRequest {
  nombre: string;
  apellido: string;
  documento: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Cuenta {
  id: number;
  numero: string;
  tipo: TipoCuenta;
  saldo: number;
  fechaCreacion: string;
}

export interface Transaccion {
  id: number;
  tipo: TipoTransaccion;
  monto: number;
  saldoResultante: number;
  descripcion: string | null;
  fecha: string;
}

export interface OperacionRequest {
  monto: number;
  descripcion?: string;
}

export interface TransferenciaRequest {
  cuentaOrigen: string;
  cuentaDestino: string;
  monto: number;
  descripcion?: string;
}

export interface Beneficiario {
  id: number;
  alias: string;
  numeroCuenta: string;
  tipoCuenta: TipoCuenta;
  titular: string;
}

export interface BeneficiarioRequest {
  alias: string;
  numeroCuenta: string;
}

export interface ApiError {
  status: number;
  error: string;
  mensaje: string;
  detalles?: Record<string, string>;
}
