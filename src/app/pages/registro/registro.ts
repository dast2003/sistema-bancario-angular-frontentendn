import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { mensajeError } from '../../core/errores';

/** Mismas reglas que valida el backend (RegistroRequest). */
const PATRON_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d).+$/;

function passwordsIguales(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const confirmar = group.get('confirmar')?.value;
  return pass && confirmar && pass !== confirmar ? { noCoinciden: true } : null;
}

type Campo = 'nombre' | 'apellido' | 'documento' | 'email' | 'password' | 'confirmar';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
})
export class Registro {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = inject(FormBuilder).nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(80)]],
      apellido: ['', [Validators.required, Validators.maxLength(80)]],
      documento: ['', [Validators.required, Validators.pattern(/^\d{6,12}$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64), Validators.pattern(PATRON_PASSWORD)]],
      confirmar: ['', Validators.required],
    },
    { validators: passwordsIguales },
  );

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.error.set(null);
    const { confirmar, ...datos } = this.form.getRawValue();
    this.auth.registrar(datos).subscribe({
      next: () => this.router.navigate(['/panel']),
      error: (err) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  invalido(campo: Campo): boolean {
    const c = this.form.controls[campo];
    const noCoinciden = campo === 'confirmar' && this.form.hasError('noCoinciden');
    return (c.invalid || noCoinciden) && c.touched;
  }
}
