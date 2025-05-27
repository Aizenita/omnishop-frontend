import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // RouterLink is fine, RouterModule is for module-based setup or routing config
import { Observable } from 'rxjs';
import { Product, ProductService } from '../../../shared/services/product.service';
import { Category } from '../../../shared/models/category.model';
import { CategoryService } from '../../../shared/services/category.service';
import { AuthService, UserIdentity } from '../../../shared/services/auth.service';
import { ButtonModule } from 'primeng/button'; // Import ButtonModule

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule], // Add ButtonModule here
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  specialOfferProducts: Product[] = [];

  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<UserIdentity | null>;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private authService: AuthService, // Inject AuthService
    private router: Router // Inject Router
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
      console.log('Productos recibidos en LandingPage (this.products):', this.products);
      this.specialOfferProducts = data.filter(product => product.destacado === true);
      console.log('Productos destacados en LandingPage (this.specialOfferProducts):', this.specialOfferProducts);
    });
    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
