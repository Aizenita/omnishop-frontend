import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service'; // Importar AuthService

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Añadir ReactiveFormsModule
    RouterModule         // Añadir RouterModule si se usan directivas como routerLink aquí
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, // Descomentar o añadir
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    this.errorMessage = null;
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => { // response aquí es AuthResponse
          console.log('Login successful', response);
          // AuthService.setSession y fetchAndSetCurrentUser ya se encargan de actualizar el estado
          this.router.navigate(['/']); // Redirigir a la página principal
        },
        error: (err) => {
          console.error('Login error:', err);
          this.errorMessage = err.message || 'Error en el login. Por favor, verifica tus credenciales.';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Por favor, corrige los errores del formulario.';
    }
  }
}
