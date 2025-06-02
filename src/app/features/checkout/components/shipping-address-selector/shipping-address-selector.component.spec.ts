import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ShippingAddressSelectorComponent } from './shipping-address-selector.component';
import { DireccionEnvioService } from '../../../../shared/services/direccion-envio.service';
import { DireccionEnvio } from '../../../../shared/models/direccion-envio.model';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';


describe('ShippingAddressSelectorComponent', () => {
  let component: ShippingAddressSelectorComponent;
  let fixture: ComponentFixture<ShippingAddressSelectorComponent>;
  let mockDireccionEnvioService: jasmine.SpyObj<DireccionEnvioService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockAddresses: DireccionEnvio[] = [
    { id: 1, calle: 'Calle 1', ciudad: 'Ciudad', cp: '11111', pais: 'Pais', predeterminada: false, usuarioId: 1 },
    { id: 2, calle: 'Calle 2 Default', ciudad: 'Ciudad', cp: '22222', pais: 'Pais', predeterminada: true, usuarioId: 1 },
  ];

  beforeEach(async () => {
    mockDireccionEnvioService = jasmine.createSpyObj('DireccionEnvioService', ['getDirecciones']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        ShippingAddressSelectorComponent, 
        RouterTestingModule, 
        HttpClientTestingModule,
        FormsModule, CardModule, DataViewModule, ButtonModule, TagModule, RadioButtonModule
      ],
      providers: [
        { provide: DireccionEnvioService, useValue: mockDireccionEnvioService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ShippingAddressSelectorComponent);
    component = fixture.componentInstance;
    mockDireccionEnvioService.getDirecciones.and.returnValue(of(mockAddresses)); // Default mock response
  });

  it('should create and load addresses on init, auto-selecting default', fakeAsync(() => {
    fixture.detectChanges(); // ngOnInit
    tick(); // for the subscribe block in ngOnInit
    
    expect(component).toBeTruthy();
    expect(mockDireccionEnvioService.getDirecciones).toHaveBeenCalled();
    component.addresses$.subscribe(addresses => expect(addresses.length).toBe(2));
    expect(component.selectedAddress).toEqual(mockAddresses[1]); // Default one
    expect(component.isLoading).toBeFalse();
  }));

  it('should handle error when loading addresses', fakeAsync(() => {
    mockDireccionEnvioService.getDirecciones.and.returnValue(throwError(() => new Error('Load error')));
    fixture.detectChanges(); // ngOnInit
    tick();
    expect(component.isLoading).toBeFalse();
    // Check for error message display if implemented, or console.error spy
  }));
  
  it('should select address and emit event on selectAddress', () => {
    spyOn(component.addressSelected, 'emit');
    const addressToSelect = mockAddresses[0];
    component.selectAddress(addressToSelect);
    expect(component.selectedAddress).toEqual(addressToSelect);
    expect(component.addressSelected.emit).toHaveBeenCalledWith(addressToSelect);
  });

  it('should navigate to add new address page on addNewAddress', () => {
    component.addNewAddress();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile/direcciones/nueva'], { queryParams: { returnUrl: '/checkout' } });
  });
});
