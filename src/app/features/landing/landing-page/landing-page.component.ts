import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, ProductService } from '../../../shared/services/product.service'; // Adjusted path

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule], // CommonModule for *ngFor, CurrencyPipe etc.
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  products: Product[] = [];

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
    });
  }
}
