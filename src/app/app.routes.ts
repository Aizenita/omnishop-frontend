import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component'; // Ruta corregida
import { LandingPageComponent } from './features/landing/landing-page/landing-page.component';
import { ProductDetailComponent } from './features/product-detail/product-detail.component';
import { CartComponent } from './features/cart/cart.component'; // Importar CartComponent
import { ProfileComponent } from './features/profile/profile.component';
import { authGuard } from './shared/guards/auth.guard';
import { DireccionListComponent } from './features/profile/components/direccion-list/direccion-list.component';
import { DireccionFormComponent } from './features/profile/components/direccion-form/direccion-form.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { CheckoutSuccessComponent } from './features/checkout/components/checkout-success/checkout-success.component'; // Added
import { CheckoutFailureComponent } from './features/checkout/components/checkout-failure/checkout-failure.component'; // Added

export const routes: Routes = [
  { path: '', component: LandingPageComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'direcciones', pathMatch: 'full' }, // Default to addresses list
      { path: 'direcciones', component: DireccionListComponent },
      { path: 'direcciones/nueva', component: DireccionFormComponent },
      { path: 'direcciones/editar/:id', component: DireccionFormComponent }
      // Potentially other profile sections here like 'pedidos', 'datos-personales'
    ]
  },
  { // New Checkout Route
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [authGuard]
  },
  { // New Checkout Success Route
    path: 'pago-ok', // Matches backend redirect
    component: CheckoutSuccessComponent,
    canActivate: [authGuard]
  },
  { // New Checkout Failure Route
    path: 'pago-ko', // Matches backend redirect
    component: CheckoutFailureComponent,
    canActivate: [authGuard]
  }
];
