import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DireccionFormComponent } from './direccion-form.component';
import { DireccionEnvioService } from '../../../../shared/services/direccion-envio.service';
import { DireccionEnvio, DireccionEnvioRequest, DireccionEnvioUpdate } from '../../../../shared/models'; // Assuming index.ts for models
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';

// PrimeNG Modules used in template
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MessagesModule } from 'primeng/messages';

// Mock for ActivatedRoute
class ActivatedRouteMock {
  private subject = new Subject<any>(); // Use 'any' or a more specific type for ParamMap
  paramMap = this.subject.asObservable();

  // Method to push values to the paramMap subject
  push(params: { [key: string]: string | null }) { // params object
    this.subject.next(convertToParamMap(params)); // Convert object to ParamMap
  }
}


describe('DireccionFormComponent', () => {
  let component: DireccionFormComponent;
  let fixture: ComponentFixture<DireccionFormComponent>;
  let mockDireccionEnvioService: jasmine.SpyObj<DireccionEnvioService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let activatedRouteMock: ActivatedRouteMock;
  let formBuilder: FormBuilder; // Keep instance if needed, or just use TestBed.inject(FormBuilder)

  const mockDireccion: DireccionEnvio = { id: 1, usuarioId: 1, calle: 'Calle Falsa 123', ciudad: 'Springfield', cp: '12345', pais: 'USA', predeterminada: true };

  beforeEach(async () => {
    mockDireccionEnvioService = jasmine.createSpyObj('DireccionEnvioService', ['getDirecciones', 'crearDireccion', 'actualizarDireccion']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteMock = new ActivatedRouteMock();
    // formBuilder will be injected via TestBed

    await TestBed.configureTestingModule({
      imports: [
        DireccionFormComponent, // Standalone component
        ReactiveFormsModule, // Already imported by DireccionFormComponent, but good for clarity
        RouterTestingModule, // For routerLink, navigate, etc. - not strictly needed if Router is mocked
        HttpClientTestingModule, // If service is not fully mocked or for other reasons
        // PrimeNG Modules
        ButtonModule,
        InputTextModule,
        CheckboxModule,
        MessagesModule
      ],
      providers: [
        { provide: DireccionEnvioService, useValue: mockDireccionEnvioService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        // FormBuilder is provided by ReactiveFormsModule, no need to explicitly provide a mock unless custom logic is needed
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DireccionFormComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder); // Get the FormBuilder instance
  });

  it('should create', () => {
    activatedRouteMock.push({}); // Push empty params for initial ngOnInit
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization (ngOnInit)', () => {
    it('should initialize for CREATE mode if no ID in route params', fakeAsync(() => {
      activatedRouteMock.push({}); // No 'id'
      fixture.detectChanges();
      tick();

      expect(component.isEditMode).toBeFalse();
      expect(component.pageTitle).toBe('Nueva Dirección');
      expect(component.direccionForm.pristine).toBeTrue();
    }));

    it('should initialize for EDIT mode if ID is present in route params and load data (mocking getDirecciones)', fakeAsync(() => {
      mockDireccionEnvioService.getDirecciones.and.returnValue(of([mockDireccion]));
      activatedRouteMock.push({ id: '1' });
      fixture.detectChanges();
      tick();

      expect(component.isEditMode).toBeTrue();
      expect(component.direccionId).toBe(1);
      expect(component.pageTitle).toBe('Editar Dirección');
      expect(mockDireccionEnvioService.getDirecciones).toHaveBeenCalled();
      expect(component.direccionForm.value.calle).toBe(mockDireccion.calle);
    }));

    it('should handle error if address not found in EDIT mode (from getDirecciones)', fakeAsync(() => {
      mockDireccionEnvioService.getDirecciones.and.returnValue(of([ { ...mockDireccion, id: 2 } ]));
      activatedRouteMock.push({ id: '1' });
      fixture.detectChanges();
      tick();

      expect(component.isEditMode).toBeTrue();
      expect(component.msgs.length).toBe(1);
      expect(component.msgs[0].severity).toBe('error');
      expect(component.msgs[0].detail).toContain('Dirección no encontrada para editar');
    }));

    it('should handle service error during data load for EDIT mode', fakeAsync(() => {
      mockDireccionEnvioService.getDirecciones.and.returnValue(throwError(() => new Error('Load error')));
      activatedRouteMock.push({ id: '1' });
      fixture.detectChanges();
      tick();

      expect(component.isEditMode).toBeTrue();
      expect(component.msgs.length).toBe(1);
      expect(component.msgs[0].severity).toBe('error');
      expect(component.msgs[0].detail).toContain('Error al cargar los datos de la dirección');
    }));
     it('should show warning if getDirecciones is not available on service in EDIT mode', fakeAsync(() => {
      // Temporarily make getDirecciones undefined on the mock for this specific test
      (mockDireccionEnvioService as any).getDirecciones = undefined;
      activatedRouteMock.push({ id: '1' });
      fixture.detectChanges();
      tick();

      expect(component.isEditMode).toBeTrue();
      expect(component.msgs.length).toBe(1);
      expect(component.msgs[0].severity).toBe('warn');
      expect(component.msgs[0].detail).toContain('Servicio para cargar dirección individual no implementado.');
    }));
  });

  describe('guardarDireccion - CREATE mode', () => {
    beforeEach(fakeAsync(() => {
      activatedRouteMock.push({});
      fixture.detectChanges();
      tick();
      component.direccionForm.setValue({ calle: 'Test', ciudad: 'Test', cp: '12345', pais: 'Test', predeterminada: false });
    }));

    it('should call service.crearDireccion and navigate on success', fakeAsync(() => {
      mockDireccionEnvioService.crearDireccion.and.returnValue(of(mockDireccion));
      component.guardarDireccion();
      tick();

      expect(mockDireccionEnvioService.crearDireccion).toHaveBeenCalledWith(jasmine.objectContaining({ calle: 'Test' }));
      expect(mockRouter.navigate).toHaveBeenCalledWith(['../'], { relativeTo: (fixture.debugElement.injector.get(ActivatedRoute) as any) });
    }));

    it('should display error if service.crearDireccion fails', fakeAsync(() => {
      mockDireccionEnvioService.crearDireccion.and.returnValue(throwError(() => new Error('Create error')));
      component.guardarDireccion();
      tick();

      expect(mockDireccionEnvioService.crearDireccion).toHaveBeenCalled();
      expect(component.msgs.length).toBe(1);
      expect(component.msgs[0].severity).toBe('error');
      expect(component.msgs[0].detail).toContain('Error al crear la dirección');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));
  });

  describe('guardarDireccion - EDIT mode', () => {
    beforeEach(fakeAsync(() => {
      mockDireccionEnvioService.getDirecciones.and.returnValue(of([mockDireccion]));
      activatedRouteMock.push({ id: '1' });
      fixture.detectChanges();
      tick();
      component.direccionForm.patchValue({ calle: 'Updated Calle' });
    }));

    it('should call service.actualizarDireccion and navigate on success', fakeAsync(() => {
      mockDireccionEnvioService.actualizarDireccion.and.returnValue(of({ ...mockDireccion, calle: 'Updated Calle' }));
      component.guardarDireccion();
      tick();

      expect(mockDireccionEnvioService.actualizarDireccion).toHaveBeenCalledWith(1, jasmine.objectContaining({ calle: 'Updated Calle' }));
      expect(mockRouter.navigate).toHaveBeenCalledWith(['../'], { relativeTo: (fixture.debugElement.injector.get(ActivatedRoute) as any) });
    }));

    it('should display error if service.actualizarDireccion fails', fakeAsync(() => {
      mockDireccionEnvioService.actualizarDireccion.and.returnValue(throwError(() => new Error('Update error')));
      component.guardarDireccion();
      tick();

      expect(mockDireccionEnvioService.actualizarDireccion).toHaveBeenCalled();
      expect(component.msgs.length).toBe(1);
      expect(component.msgs[0].severity).toBe('error');
      expect(component.msgs[0].detail).toContain('Error al actualizar la dirección');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));
  });

  describe('Form Validation', () => {
    beforeEach(fakeAsync(() => {
      activatedRouteMock.push({});
      fixture.detectChanges();
      tick();
    }));

    it('should not submit if form is invalid', () => {
      component.direccionForm.setValue({ calle: '', ciudad: '', cp: '', pais: '', predeterminada: false });
      component.guardarDireccion();

      expect(mockDireccionEnvioService.crearDireccion).not.toHaveBeenCalled();
      expect(mockDireccionEnvioService.actualizarDireccion).not.toHaveBeenCalled();
      expect(component.msgs.length).toBe(1);
      expect(component.msgs[0].severity).toBe('error');
      expect(component.msgs[0].detail).toContain('Por favor, corrija los errores');
    });
  });

  describe('cancelar', () => {
    it('should navigate to parent route', () => {
      component.cancelar();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['../'], { relativeTo: (fixture.debugElement.injector.get(ActivatedRoute) as any) });
    });
  });
});
