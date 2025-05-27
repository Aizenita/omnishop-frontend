import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Product, ProductService } from '../../../shared/services/product.service';
import { Observable, of, EMPTY } from 'rxjs'; // EMPTY para catchError
import { catchError } from 'rxjs/operators';
// Importaciones PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image'; // Opcional para p-image
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner'; // Añadido para p-progressSpinner

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    ImageModule, // Opcional
    ToastModule,
    ProgressSpinnerModule // Añadido
  ],
  providers: [MessageService], // Proveer MessageService
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product$!: Observable<Product | undefined>;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private messageService: MessageService // Inyectar MessageService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const productId = +idParam;
      if (!isNaN(productId)) {
        this.product$ = this.productService.getProductById(productId).pipe(
          catchError(err => {
            console.error('Error loading product:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo cargar el producto. Inténtalo más tarde.'
            });
            return of(undefined); // Devuelve undefined para que el template muestre 'loadingOrNotFound'
          })
        );
      } else {
        this.handleInvalidId('ID de producto inválido en la ruta:', idParam);
      }
    } else {
      this.handleInvalidId('No se encontró ID de producto en la ruta.', null);
    }
  }

  private handleInvalidId(errorMessage: string, idParam: string | null): void {
    console.error(errorMessage, idParam);
    this.messageService.add({
      severity: 'error',
      summary: 'Error de Navegación',
      detail: idParam ? `El ID de producto '${idParam}' no es válido.` : 'No se especificó un ID de producto.'
    });
    this.product$ = of(undefined);
  }
}
