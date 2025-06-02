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
// Import new confirmation component
import { OrderConfirmedComponent } from './features/checkout/components/order-confirmed/order-confirmed.component'; 
// Remove old success/failure component imports if they were here
// import { CheckoutSuccessComponent } from './features/checkout/components/checkout-success/checkout-success.component'; 
// import { CheckoutFailureComponent } from './features/checkout/components/checkout-failure/checkout-failure.component'; 

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
  { // New Order Confirmed Route
    path: 'pedido-confirmado/:orderId', 
    component: OrderConfirmedComponent,
    canActivate: [authGuard] 
  }
  // Removed /pago-ok and /pago-ko routes
  // { 
  //   path: 'pago-ok',
  //   component: CheckoutSuccessComponent, // This component will be deleted
  //   canActivate: [authGuard] 
  // },
  // { 
  //   path: 'pago-ko',
  //   component: CheckoutFailureComponent, // This component will be deleted
  //   canActivate: [authGuard] 
  // }

];
