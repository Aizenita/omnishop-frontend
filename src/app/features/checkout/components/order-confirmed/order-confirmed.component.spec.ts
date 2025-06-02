import { ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { OrderConfirmedComponent } from './order-confirmed.component';
import { of } from 'rxjs';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

describe('OrderConfirmedComponent', () => {
  let component: OrderConfirmedComponent;
  let fixture: ComponentFixture<OrderConfirmedComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const testOrderId = '12345XYZ';

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: convertToParamMap({ orderId: testOrderId })
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        OrderConfirmedComponent, // Standalone
        RouterTestingModule, // For routerLink if any, and general router setup
        CardModule,
        ButtonModule
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderConfirmedComponent);
    component = fixture.componentInstance;
  });

  it('should create and get orderId from route', () => {
    fixture.detectChanges(); // ngOnInit
    expect(component).toBeTruthy();
    expect(component.orderId).toBe(testOrderId);
  });

  it('should start countdown and redirect after timeout', fakeAsync(() => {
    fixture.detectChanges(); // ngOnInit, starts timer
    expect(component.countdown).toBe(5); // Initial value before first tick of countdownSubscription

    tick(1000); // 1 second passes
    fixture.detectChanges();
    expect(component.countdown).toBe(4);

    tick(4000); // 4 more seconds pass (total 5 seconds)
    fixture.detectChanges();
    expect(component.countdown).toBe(0); // Countdown finished
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    
    // Clean up any remaining timers
    component.ngOnDestroy(); 
    discardPeriodicTasks();
  }));

  it('should navigate to home immediately when navigateToHome is called', () => {
    fixture.detectChanges(); // ngOnInit
    // Ensure subscriptions are created before spying on them
    expect(component.timerSubscription).toBeDefined();
    expect(component.countdownSubscription).toBeDefined();

    spyOn(component.timerSubscription!, 'unsubscribe'); 
    spyOn(component.countdownSubscription!, 'unsubscribe');
    
    component.navigateToHome();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    expect(component.timerSubscription!.unsubscribe).toHaveBeenCalled();
    expect(component.countdownSubscription!.unsubscribe).toHaveBeenCalled();
  });
  
  it('should unsubscribe from timers on ngOnDestroy', () => {
    fixture.detectChanges(); // ngOnInit, timers start
    // Ensure subscriptions are created before spying on them
    expect(component.timerSubscription).toBeDefined();
    expect(component.countdownSubscription).toBeDefined();
    
    spyOn(component.timerSubscription!, 'unsubscribe');
    spyOn(component.countdownSubscription!, 'unsubscribe');

    component.ngOnDestroy();

    expect(component.timerSubscription!.unsubscribe).toHaveBeenCalled();
    expect(component.countdownSubscription!.unsubscribe).toHaveBeenCalled();
  });
});
