import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Product, ProductService } from '../../../shared/services/product.service'; // Product ya está importado
import { Category } from '../../../shared/models/category.model';
import { CategoryService } from '../../../shared/services/category.service';
import { AuthService, UserIdentity } from '../../../shared/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { CartService } from '../../../shared/services/cart.service';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast'; // NUEVA importación
import { MessageService } from 'primeng/api'; // NUEVA importación


@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    ButtonModule,
    BadgeModule,
    ToastModule  // AÑADIR ToastModule
  ],
  providers: [MessageService], // AÑADIR MessageService a providers
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  specialOfferProducts: Product[] = [];

  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<UserIdentity | null>;
  cartItemCount$: Observable<number>;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private messageService: MessageService // INYECTAR MessageService
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
    this.cartItemCount$ = this.cartService.getCartItemCount();
  }

  ngOnInit(): void {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
      this.specialOfferProducts = data.filter(product => product.destacado === true);
    });
    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  quickAddToCart(product: Product): void {
    if (product && product.id) {
      this.cartService.addItem(product, 1); // Añade 1 unidad por defecto
      this.messageService.add({
        severity: 'success',
        summary: 'Producto Añadido',
        detail: `${product.nombre} ha sido añadido a tu carrito.`,
        life: 3000 // Duración del toast en milisegundos
      });
    } else {
      console.error('Intento de añadir producto inválido o sin ID:', product);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo añadir el producto al carrito.',
        life: 3000
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); // Navigate to login page after logout
  }
}
