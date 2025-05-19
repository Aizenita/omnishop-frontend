import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm!: FormGroup; 

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {this.registerForm = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required]
  });}

  onSubmit() {
    if (this.registerForm.valid && this.passwordsMatch()) {
      const { nombre, email, password } = this.registerForm.value;
      this.http.post('/api/auth/register', { nombre, email, password })
        .subscribe({
          next: () => this.router.navigate(['/login']),
          error: err => alert('Error en el registro: ' + err.error?.message || err.message)
        });
    }
  }

  passwordsMatch() {
    return this.registerForm.value.password === this.registerForm.value.confirmPassword;
  }
}
