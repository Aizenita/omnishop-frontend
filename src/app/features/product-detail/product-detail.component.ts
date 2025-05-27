import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router'; // RouterModule para routerLink
import { Product, ProductService } from '../../../shared/services/product.service';
import { Observable, of } from 'rxjs'; // 'of' para el caso de id no válido

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule], // Añade RouterModule
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product$!: Observable<Product | undefined>; // Usar el operador de aserción no nula

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const productId = +idParam; // Convertir a número
      if (!isNaN(productId)) {
        this.product$ = this.productService.getProductById(productId);
      } else {
        console.error('Invalid product ID:', idParam);
        this.product$ = of(undefined); // Maneja el error de ID no numérico
      }
    } else {
      console.error('No product ID found in route');
      this.product$ = of(undefined); // Maneja el error de ID no encontrado
    }
  }
}
