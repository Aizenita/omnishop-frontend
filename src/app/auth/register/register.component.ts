import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service'; // Importar AuthService

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Añadir ReactiveFormsModule
    RouterModule         // Añadir RouterModule para routerLink
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, // Descomentar o añadir
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]] // Ejemplo de validación extra
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    this.errorMessage = null;
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => { // response aquí es AuthResponse
          console.log('Registration successful', response);
          // AuthService.setSession y fetchAndSetCurrentUser ya se encargan de actualizar el estado
          // Considera si quieres loguear al usuario directamente o redirigir a login.
          // Por ahora, redirigimos a login con un mensaje.
          // Podrías añadir un alert o un toast para "Registro exitoso, por favor inicia sesión."
          this.router.navigate(['/login'], { queryParams: { registered: 'true' } }); 
        },
        error: (err) => {
          console.error('Registration error:', err);
          this.errorMessage = err.message || 'Error en el registro. Por favor, inténtalo de nuevo.';
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Por favor, corrige los errores del formulario.';
    }
  }
}
