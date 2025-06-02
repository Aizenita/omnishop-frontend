import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderReviewComponent } from './order-review.component';
import { CartService, CartItem } from '../../../../shared/services/cart.service';
import { BehaviorSubject, of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // CartService might need it
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

class MockCartService {
  items$ = new BehaviorSubject<CartItem[]>([]);
  getCartSubtotal() { return new BehaviorSubject<number>(0).asObservable(); }
}

describe('OrderReviewComponent', () => {
  let component: OrderReviewComponent;
  let fixture: ComponentFixture<OrderReviewComponent>;
  let mockCartService: MockCartService;

  const mockCartItems: CartItem[] = [{ productId: 1, nombre: 'Test Item', precio: 100, cantidad: 2, imagen: 'img.jpg' }];
  const mockSubtotal = 200;

  beforeEach(async () => {
    mockCartService = new MockCartService();

    await TestBed.configureTestingModule({
      imports: [OrderReviewComponent, HttpClientTestingModule, CardModule, TableModule, ButtonModule],
      providers: [{ provide: CartService, useValue: mockCartService }]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderReviewComponent);
    component = fixture.componentInstance;
    
    mockCartService.items$.next(mockCartItems);
    (mockCartService.getCartSubtotal() as BehaviorSubject<number>).next(mockSubtotal);
    
    fixture.detectChanges(); // ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get cart items and subtotal from CartService on init', (done) => {
    component.cartItems$.subscribe(items => {
      expect(items).toEqual(mockCartItems);
      component.cartSubtotal$.subscribe(subtotal => {
        expect(subtotal).toEqual(mockSubtotal);
        done();
      });
    });
  });
});
