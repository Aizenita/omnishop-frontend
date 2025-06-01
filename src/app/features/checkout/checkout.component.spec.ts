import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CheckoutComponent } from './checkout.component';
import { CheckoutService } from './services/checkout.service';
import { CartService, CartItem } from '../../shared/services/cart.service';
import { DireccionEnvio } from '../../shared/models/direccion-envio.model';
import { RedsysParamsDto } from '../../shared/models/redsys-params.dto';
import { of, throwError, Subject, BehaviorSubject } from 'rxjs';
import { Renderer2 } from '@angular/core';
import { By } from '@angular/platform-browser';

// Import Standalone Child Components & PrimeNG Modules used in CheckoutComponent's template
import { OrderReviewComponent } from './components/order-review/order-review.component';
import { ShippingAddressSelectorComponent } from './components/shipping-address-selector/shipping-address-selector.component';
import { OrderSummaryComponent } from './components/order-summary/order-summary.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';

// Mock Services
class MockCartService {
  items$ = new BehaviorSubject<CartItem[]>([]);
  getCartSubtotal() { return new BehaviorSubject<number>(0).asObservable(); }
  // Mock other methods if directly called by CheckoutComponent, though mostly through observables
}

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let mockCheckoutService: jasmine.SpyObj<CheckoutService>;
  let mockCartService: MockCartService;
  let mockRenderer: jasmine.SpyObj<Renderer2>;

  const mockShippingAddress: DireccionEnvio = { id: 1, usuarioId: 1, calle: '123 Main St', ciudad: 'Anytown', cp: '12345', pais: 'USA', predeterminada: true };
  const mockCartItems: CartItem[] = [{ productId: 1, nombre: 'Test Product', precio: 10, cantidad: 2, imagen: 'test.jpg' }];
  const mockCartTotal: number = 20;

  beforeEach(async () => {
    mockCheckoutService = jasmine.createSpyObj('CheckoutService', ['iniciarPagoRedsys']);
    mockCartService = new MockCartService();
    mockRenderer = jasmine.createSpyObj('Renderer2', ['createElement', 'setAttribute', 'appendChild', 'removeChild', 'setStyle']);

    // Mock document.body.submit if it's directly called (it is via form.submit())
    // This might be tricky as form.submit() is a native browser function.
    // We'll test that the form is created and document.body.appendChild(form) is called.
    // Then we can assume form.submit() would work.

    await TestBed.configureTestingModule({
      imports: [
        CheckoutComponent, // Standalone component itself
        OrderReviewComponent, // Child standalone components
        ShippingAddressSelectorComponent,
        OrderSummaryComponent,
        RouterTestingModule,
        HttpClientTestingModule, // For services if not fully mocked
        // PrimeNG modules used in CheckoutComponent's template
        CardModule,
        ButtonModule,
        MessagesModule
      ],
      providers: [
        { provide: CheckoutService, useValue: mockCheckoutService },
        { provide: CartService, useValue: mockCartService },
        { provide: Renderer2, useValue: mockRenderer }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;

    // Initial values for cart service mocks
    mockCartService.items$.next(mockCartItems);
    (mockCartService.getCartSubtotal() as BehaviorSubject<number>).next(mockCartTotal);

    fixture.detectChanges(); // ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.currentStep).toBe('review');
  });

  it('should subscribe to cart items and total on init', () => {
    expect((component as any).cartItems).toEqual(mockCartItems);
    expect((component as any).cartTotal).toEqual(mockCartTotal);
  });

  it('should move to "address" step when "Siguiente: Dirección de Envío" is clicked', () => {
    component.currentStep = 'review';
    fixture.detectChanges();
    const nextButton = fixture.debugElement.query(By.css('button[label="Siguiente: Dirección de Envío"]'));
    nextButton.triggerEventHandler('click', null);
    expect(component.currentStep).toBe('address');
  });

  it('should handle onAddressSelected and move to "summary" step', () => {
    component.onAddressSelected(mockShippingAddress);
    expect(component.selectedShippingAddress).toEqual(mockShippingAddress);
    expect(component.currentStep).toBe('summary');
    expect(component.msgs.length).toBe(0);
  });

  it('should move to "address" step when editAddress is called', () => {
    component.currentStep = 'summary';
    component.selectedShippingAddress = mockShippingAddress;
    component.editAddress();
    expect(component.selectedShippingAddress).toBeNull();
    expect(component.currentStep).toBe('address');
  });

  describe('proceedToPayment', () => {
    beforeEach(() => {
      component.selectedShippingAddress = mockShippingAddress;
      component.currentStep = 'summary';
      // Ensure cart items and total are set for the component instance
      (component as any).cartItems = mockCartItems;
      (component as any).cartTotal = mockCartTotal; // This is subtotal
      fixture.detectChanges();
    });

    it('should show error if no shipping address is selected', () => {
      component.selectedShippingAddress = null;
      component.proceedToPayment();
      expect(component.msgs.length).toBe(1);
      expect(component.msgs[0].severity).toBe('error');
      expect(component.msgs[0].detail).toContain('Por favor, seleccione una dirección de envío.');
      expect(mockCheckoutService.iniciarPagoRedsys).not.toHaveBeenCalled();
    });

    it('should show error if cart is empty', () => {
      (component as any).cartItems = []; // Simulate empty cart
      component.proceedToPayment();
      expect(component.msgs.length).toBe(1);
      expect(component.msgs[0].severity).toBe('error');
      expect(component.msgs[0].detail).toContain('Tu carrito está vacío.');
      expect(mockCheckoutService.iniciarPagoRedsys).not.toHaveBeenCalled();
    });

    it('should call checkoutService.iniciarPagoRedsys and redirect on success', fakeAsync(() => {
      const mockRedsysParams: RedsysParamsDto = {
        redsysUrl: 'https://test.redsys.url',
        dsSignatureVersion: 'HMAC_SHA256_V1',
        dsMerchantParameters: 'params',
        dsSignature: 'sig'
      };
      mockCheckoutService.iniciarPagoRedsys.and.returnValue(of(mockRedsysParams));

      const formMock = { submit: jasmine.createSpy('submit') };
      mockRenderer.createElement.and.returnValue(formMock); // Return the mock form

      component.proceedToPayment();
      tick(); // Process observables and promise-like operations

      const expectedShippingCost = 5.00;
      const expectedTaxRate = 0.10;
      const expectedTaxes = mockCartTotal * expectedTaxRate;
      const expectedFinalTotal = parseFloat((mockCartTotal + expectedShippingCost + expectedTaxes).toFixed(2));

      expect(mockCheckoutService.iniciarPagoRedsys).toHaveBeenCalledWith(jasmine.objectContaining({
        shippingAddressId: mockShippingAddress.id,
        items: [{ productoId: mockCartItems[0].productId, cantidad: mockCartItems[0].cantidad }],
        totalAmount: expectedFinalTotal
      }));

      // Test dynamic form creation and submission
      expect(mockRenderer.createElement).toHaveBeenCalledWith('form');
      expect(mockRenderer.setAttribute).toHaveBeenCalledWith(formMock, 'method', 'POST');
      expect(mockRenderer.setAttribute).toHaveBeenCalledWith(formMock, 'action', mockRedsysParams.redsysUrl);
      // Check for hidden inputs
      expect(mockRenderer.createElement).toHaveBeenCalledWith('input'); // Called for each input
      expect(mockRenderer.setAttribute).toHaveBeenCalledWith(jasmine.any(Object), 'name', 'Ds_SignatureVersion');
      expect(mockRenderer.setAttribute).toHaveBeenCalledWith(jasmine.any(Object), 'name', 'Ds_MerchantParameters');
      expect(mockRenderer.setAttribute).toHaveBeenCalledWith(jasmine.any(Object), 'name', 'Ds_Signature');

      expect(mockRenderer.appendChild).toHaveBeenCalledWith(document.body, formMock);
      expect(formMock.submit).toHaveBeenCalled();
      expect(mockRenderer.removeChild).toHaveBeenCalledWith(document.body, formMock);

      expect(component.isLoadingPayment).toBeTrue(); // Remains true as it redirects
    }));

    it('should display error and reset step if iniciarPagoRedsys fails', fakeAsync(() => {
      mockCheckoutService.iniciarPagoRedsys.and.returnValue(throwError(() => new Error('Payment init error')));
      component.proceedToPayment();
      tick();

      expect(mockCheckoutService.iniciarPagoRedsys).toHaveBeenCalled();
      expect(component.isLoadingPayment).toBeFalse();
      expect(component.msgs.length).toBe(1);
      expect(component.msgs[0].severity).toBe('error');
      expect(component.msgs[0].detail).toContain('No se pudo iniciar el proceso de pago.');
      expect(component.currentStep).toBe('summary'); // Back to summary to show error
    }));
  });

  it('should unsubscribe on destroy', () => {
    spyOn((component as any).subscriptions, 'unsubscribe');
    component.ngOnDestroy();
    expect((component as any).subscriptions.unsubscribe).toHaveBeenCalled();
  });
});
