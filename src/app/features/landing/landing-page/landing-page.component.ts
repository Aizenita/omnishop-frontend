import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // Import RouterLink
import { Product, ProductService } from '../../../shared/services/product.service'; // Adjusted path
import { Category } from '../../../shared/models/category.model';
import { CategoryService } from '../../../shared/services/category.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink], // Add RouterLink here
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  specialOfferProducts: Product[] = [];

  constructor(private productService: ProductService, private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
      this.specialOfferProducts = data.filter(product => product.destacado === true);
    });
    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }
}
