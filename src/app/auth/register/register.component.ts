import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

// Importaciones PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  // errorMessage: string | null = null; // Ya no se necesita

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('Registration successful', response);
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Registro Exitoso', 
            detail: 'Serás redirigido para iniciar sesión.' 
          });
          // Pequeña demora para que el toast sea visible antes de redirigir
          setTimeout(() => {
            this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
          }, 1500);
        },
        error: (err) => {
          console.error('Registration error:', err);
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error de Registro', 
            detail: err.message || 'No se pudo completar el registro. Inténtalo de nuevo.' 
          });
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Atención', 
        detail: 'Por favor, completa todos los campos correctamente.' 
      });
    }
  }
}
