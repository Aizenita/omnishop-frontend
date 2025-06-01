import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckoutFailureComponent } from './checkout-failure.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

describe('CheckoutFailureComponent', () => {
  let component: CheckoutFailureComponent;
  let fixture: ComponentFixture<CheckoutFailureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutFailureComponent, RouterTestingModule, CardModule, ButtonModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => null } } } // Basic mock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutFailureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
