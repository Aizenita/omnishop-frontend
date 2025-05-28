import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Product, ProductService } from '../../../shared/services/product.service';
import { Category } from '../../../shared/models/category.model';
import { CategoryService } from '../../../shared/services/category.service';
import { AuthService, UserIdentity } from '../../../shared/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { CartService } from '../../../shared/services/cart.service'; // Nueva importación
import { BadgeModule } from 'primeng/badge'; // Nueva importación

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    ButtonModule,
    BadgeModule  // Añadir BadgeModule
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  specialOfferProducts: Product[] = [];

  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<UserIdentity | null>;
  cartItemCount$: Observable<number>; // Nueva propiedad

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private cartService: CartService, // Inyectar CartService
    private router: Router
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
    this.cartItemCount$ = this.cartService.getCartItemCount(); // Asignar observable
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); // Navigate to login page after logout
  }
}
