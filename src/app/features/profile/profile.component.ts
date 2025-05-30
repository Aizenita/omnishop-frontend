import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service'; 
import { UserIdentity } from '../../shared/services/auth.service'; 
import { Observable } from 'rxjs';
import { RouterModule } from '@angular/router'; // Added for routerLink/router-outlet
import { CardModule } from 'primeng/card'; // Importar CardModule
import { ButtonModule } from 'primeng/button'; // Importar ButtonModule

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // Added for routerLink/router-outlet
    CardModule,    // Añadir CardModule
    ButtonModule   // Añadir ButtonModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  currentUser$: Observable<UserIdentity | null>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Opcional: Si necesitas hacer algo más al iniciar, como cargar datos específicos del perfil.
    // Por ahora, solo mostramos la información del currentUser$ de AuthService.
  }

  editProfile() { 
    console.log('Editar perfil clickeado'); 
  }
}