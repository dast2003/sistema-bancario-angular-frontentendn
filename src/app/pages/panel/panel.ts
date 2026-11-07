import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { BancoService } from '../../core/banco.service';
import { mensajeError } from '../../core/errores';
import { Beneficiario, Cuenta, TipoCuenta, TipoTransaccion, Transaccion } from '../../core/models';

type Operacion = 'deposito' | 'retiro' | 'transferencia';

const ETIQUETAS: Record<TipoTransaccion, { texto: string; entrada: boolean }> = {
  DEPOSITO: { texto: 'Deposito', entrada: true },
  RETIRO: { texto: 'Retiro', entrada: false },
  TRANSFERENCIA_ENVIADA: { texto: 'Transferencia enviada', entrada: false },
  TRANSFERENCIA_RECIBIDA: { texto: 'Transferencia recibida', entrada: true },
};

const pesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 2 });

@Component({
  selector: 'app-panel',
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe],
  templateUrl: './panel.html',
})
export class Panel implements OnInit {
  private readonly banco = inject(BancoService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly usuario = this.auth.usuario;
  readonly cuentas = signal<Cuenta[]>([]);
  readonly seleccionada = signal<Cuenta | null>(null);
  readonly movimientos = signal<Transaccion[]>([]);
  readonly beneficiarios = signal<Beneficiario[]>([]);
  readonly mostrarNuevoBeneficiario = signal(false);
  readonly guardandoBeneficiario = signal(false);
  readonly operacion = signal<Operacion>('deposito');
  readonly cargando = signal(true);
  readonly procesando = signal(false);
  readonly mostrarNuevaCuenta = signal(false);
  readonly copiado = signal(false);
  readonly aviso = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  readonly saldoTotal = computed(() => this.cuentas().reduce((total, c) => total + c.saldo, 0));

  readonly operaciones: { id: Operacion; texto: string }[] = [
    { id: 'deposito', texto: 'Depositar' },
    { id: 'retiro', texto: 'Retirar' },
    { id: 'transferencia', texto: 'Transferir' },
  ];

  readonly form = this.fb.group({
    monto: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    cuentaDestino: this.fb.nonNullable.control(''),
    descripcion: this.fb.nonNullable.control('', Validators.maxLength(200)),
  });

  private readonly destino = toSignal(this.form.controls.cuentaDestino.valueChanges, { initialValue: '' });

  readonly formBeneficiario = this.fb.nonNullable.group({
    alias: ['', [Validators.required, Validators.maxLength(40)]],
    numeroCuenta: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
  });

  /** Beneficiario que coincide con la cuenta digitada, para confirmar a quien se le envia. */
  readonly destinoInscrito = computed(() => this.beneficiarios().find((b) => b.numeroCuenta === this.destino()) ?? null);

  ngOnInit(): void {
    this.cargarCuentas();
    this.cargarBeneficiarios();
  }

  cargarBeneficiarios(): void {
    this.banco.beneficiarios().subscribe({
      next: (lista) => this.beneficiarios.set(lista),
      error: (err) => this.mostrarAviso('error', mensajeError(err)),
    });
  }

  inscribirBeneficiario(): void {
    if (this.formBeneficiario.invalid) {
      this.formBeneficiario.markAllAsTouched();
      return;
    }
    this.guardandoBeneficiario.set(true);
    this.banco.inscribirBeneficiario(this.formBeneficiario.getRawValue()).subscribe({
      next: (b) => {
        this.mostrarAviso('ok', `${b.alias} (${b.titular}) quedo inscrito como beneficiario.`);
        this.formBeneficiario.reset();
        this.mostrarNuevoBeneficiario.set(false);
        this.guardandoBeneficiario.set(false);
        this.cargarBeneficiarios();
      },
      error: (err) => {
        this.mostrarAviso('error', mensajeError(err));
        this.guardandoBeneficiario.set(false);
      },
    });
  }

  eliminarBeneficiario(b: Beneficiario): void {
    if (!confirm(`¿Eliminar a ${b.alias} de tus beneficiarios?`)) return;
    this.banco.eliminarBeneficiario(b.id).subscribe({
      next: () => {
        this.mostrarAviso('ok', `${b.alias} fue eliminado de tus beneficiarios.`);
        this.cargarBeneficiarios();
      },
      error: (err) => this.mostrarAviso('error', mensajeError(err)),
    });
  }

  /** Lleva al formulario de transferencia con la cuenta del beneficiario ya escrita. */
  transferirA(b: Beneficiario): void {
    this.cambiarOperacion('transferencia');
    this.form.controls.cuentaDestino.setValue(b.numeroCuenta);
    document.getElementById('monto')?.focus();
  }

  elegirDestino(numero: string): void {
    this.form.controls.cuentaDestino.setValue(numero);
  }

  invalidoBeneficiario(campo: 'alias' | 'numeroCuenta'): boolean {
    const c = this.formBeneficiario.controls[campo];
    return c.invalid && c.touched;
  }

  cargarCuentas(numeroASeleccionar?: string): void {
    this.banco.misCuentas().subscribe({
      next: (cuentas) => {
        this.cuentas.set(cuentas);
        const buscado = numeroASeleccionar ?? this.seleccionada()?.numero;
        this.seleccionar(cuentas.find((c) => c.numero === buscado) ?? cuentas[0] ?? null);
        this.cargando.set(false);
      },
      error: (err) => {
        this.mostrarAviso('error', mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  seleccionar(cuenta: Cuenta | null): void {
    this.seleccionada.set(cuenta);
    this.movimientos.set([]);
    if (cuenta) {
      this.banco.movimientos(cuenta.numero).subscribe({
        next: (m) => this.movimientos.set(m),
        error: (err) => this.mostrarAviso('error', mensajeError(err)),
      });
    }
  }

  cambiarOperacion(op: Operacion): void {
    this.operacion.set(op);
    this.aviso.set(null);
    const destino = this.form.controls.cuentaDestino;
    if (op === 'transferencia') {
      destino.setValidators([Validators.required, Validators.pattern(/^\d{10}$/)]);
    } else {
      destino.clearValidators();
    }
    destino.updateValueAndValidity();
  }

  ejecutar(): void {
    const cuenta = this.seleccionada();
    if (!cuenta || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { monto, cuentaDestino, descripcion } = this.form.getRawValue();
    const req = { monto: monto as number, descripcion: descripcion.trim() || undefined };

    const op = this.operacion();
    const llamada: Observable<Transaccion> =
      op === 'deposito'
        ? this.banco.depositar(cuenta.numero, req)
        : op === 'retiro'
          ? this.banco.retirar(cuenta.numero, req)
          : this.banco.transferir({ cuentaOrigen: cuenta.numero, cuentaDestino, ...req });

    this.procesando.set(true);
    llamada.subscribe({
      next: (t) => {
        this.mostrarAviso('ok', `${this.etiqueta(t.tipo)} por ${pesos.format(t.monto)} realizado. Nuevo saldo: ${pesos.format(t.saldoResultante)}`);
        this.form.reset();
        this.procesando.set(false);
        this.cargarCuentas(cuenta.numero);
      },
      error: (err) => {
        this.mostrarAviso('error', mensajeError(err));
        this.procesando.set(false);
      },
    });
  }

  abrirCuenta(tipo: TipoCuenta): void {
    this.banco.abrirCuenta(tipo).subscribe({
      next: (c) => {
        this.mostrarNuevaCuenta.set(false);
        this.mostrarAviso('ok', `Cuenta ${this.nombreTipo(c.tipo)} ${c.numero} creada.`);
        this.cargarCuentas(c.numero);
      },
      error: (err) => this.mostrarAviso('error', mensajeError(err)),
    });
  }

  copiarNumero(numero: string): void {
    navigator.clipboard?.writeText(numero).then(() => {
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 1500);
    });
  }

  logout(): void {
    this.auth.logout();
  }

  etiqueta(tipo: TipoTransaccion): string {
    return ETIQUETAS[tipo].texto;
  }

  esEntrada(tipo: TipoTransaccion): boolean {
    return ETIQUETAS[tipo].entrada;
  }

  nombreTipo(tipo: TipoCuenta): string {
    return tipo === 'AHORROS' ? 'de ahorros' : 'corriente';
  }

  invalido(campo: 'monto' | 'cuentaDestino' | 'descripcion'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && c.touched;
  }

  private mostrarAviso(tipo: 'ok' | 'error', texto: string): void {
    this.aviso.set({ tipo, texto });
  }
}
