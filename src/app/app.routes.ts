import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component'; // Ruta corregida
import { LandingPageComponent } from './features/landing/landing-page/landing-page.component';
import { ProductDetailComponent } from './features/product-detail/product-detail.component';
import { CartComponent } from './features/cart/cart.component'; // Importar CartComponent
import { ProfileComponent } from './features/profile/profile.component';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingPageComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [authGuard] // <--- AÑADIR ESTA LÍNEA
  }  
];
