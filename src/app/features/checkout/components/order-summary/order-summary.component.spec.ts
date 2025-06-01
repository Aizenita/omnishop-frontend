import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderSummaryComponent } from './order-summary.component';
import { CartService, CartItem } from '../../../../shared/services/cart.service';
import { DireccionEnvio } from '../../../../shared/models/direccion-envio.model';
import { BehaviorSubject, of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
// PrimeNG
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';


class MockCartService {
  items$ = new BehaviorSubject<CartItem[]>([]);
  getCartSubtotal() { return new BehaviorSubject<number>(0).asObservable(); }
}

describe('OrderSummaryComponent', () => {
  let component: OrderSummaryComponent;
  let fixture: ComponentFixture<OrderSummaryComponent>;
  let mockCartService: MockCartService;

  const mockShippingAddress: DireccionEnvio = { id: 1, calle: 'Addr 1', ciudad: 'City', cp: '123', pais: 'Country', predeterminada: true, usuarioId: 1 };
  const mockCartItems: CartItem[] = [{ productId: 1, nombre: 'Test Item', precio: 50, cantidad: 2, imagen: 'img.jpg' }];
  const mockSubtotal = 100;

  beforeEach(async () => {
    mockCartService = new MockCartService();

    await TestBed.configureTestingModule({
      imports: [OrderSummaryComponent, HttpClientTestingModule, CardModule, DividerModule, ButtonModule],
      providers: [{ provide: CartService, useValue: mockCartService }]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderSummaryComponent);
    component = fixture.componentInstance;

    // Set @Input
    component.shippingAddress = mockShippingAddress;

    // Mock cart service observables
    mockCartService.items$.next(mockCartItems);
    (mockCartService.getCartSubtotal() as BehaviorSubject<number>).next(mockSubtotal);

    fixture.detectChanges(); // ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display input shippingAddress', () => {
    expect(component.shippingAddress).toEqual(mockShippingAddress);
    // In a real test, you might query the DOM to see if it's rendered
  });

  it('should get cart items and subtotal from CartService', (done) => {
    component.cartItems$.subscribe(items => {
      expect(items).toEqual(mockCartItems);
      done();
    });
  });

  it('should calculate taxes and total order amount correctly', (done) => {
    const expectedShipping = component.shippingCost; // 5
    const expectedTaxRate = component.taxRate;   // 0.10
    const expectedTaxes = mockSubtotal * expectedTaxRate; // 100 * 0.10 = 10
    const expectedTotal = mockSubtotal + expectedTaxes + expectedShipping; // 100 + 10 + 5 = 115

    component.taxes$.subscribe(taxes => {
      expect(taxes).toBeCloseTo(expectedTaxes, 2);
      component.totalOrderAmount$.subscribe(total => {
        expect(total).toBeCloseTo(expectedTotal, 2);
        done();
      });
    });
  });
});
