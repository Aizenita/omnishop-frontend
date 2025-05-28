import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Product, ProductService } from '../../shared/services/product.service';
import { Observable, of, EMPTY } from 'rxjs'; // EMPTY para catchError
import { catchError } from 'rxjs/operators';

// Importaciones PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputNumberModule } from 'primeng/inputnumber'; // Añadir InputNumberModule

// Otros imports
import { FormsModule } from '@angular/forms'; // Para ngModel
import { CartService } from '../../shared/services/cart.service'; // Importar CartService


@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    ImageModule,
    ToastModule,
    ProgressSpinnerModule,
    FormsModule,         // Añadir FormsModule
    InputNumberModule    // Añadir InputNumberModule
  ],
  providers: [MessageService],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product$!: Observable<Product | undefined>;
  quantity: number = 1; // Propiedad para la cantidad

  constructor(
    public route: ActivatedRoute,
    private productService: ProductService,
    private messageService: MessageService,
    private cartService: CartService // Inyectar CartService
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
            return of(undefined);
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

  addToCart(product: Product): void {
    console.log('addToCart llamado con producto:', product); // <--- LOG 1
    console.log('Cantidad a añadir:', this.quantity); // <--- LOG 2

    if (product && product.id) { // Verifica también product.id por si acaso
      console.log('Llamando a cartService.addItem...'); // <--- LOG 3
      this.cartService.addItem(product, this.quantity);
      this.messageService.add({
        severity: 'success',
        summary: 'Añadido',
        detail: `${product.nombre} (x${this.quantity}) añadido al carrito.`
      });
      this.quantity = 1; // Resetear cantidad
    } else {
      console.error('Error: Producto inválido o sin ID en addToCart.', product); // <--- LOG 4 (Error)
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo añadir el producto al carrito. Datos del producto incompletos.'
      });
    }
  }
}
