import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckoutSuccessComponent } from './checkout-success.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

describe('CheckoutSuccessComponent', () => {
  let component: CheckoutSuccessComponent;
  let fixture: ComponentFixture<CheckoutSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutSuccessComponent, RouterTestingModule, CardModule, ButtonModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => null } } } // Basic mock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
