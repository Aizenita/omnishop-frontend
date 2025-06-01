import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DireccionListComponent } from './direccion-list.component';
import { DireccionEnvioService } from '../../../../shared/services/direccion-envio.service';
import { DireccionEnvio } from '../../../../shared/models/direccion-envio.model';
import { of, throwError } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Message } from 'primeng/api';

// Import PrimeNG modules used in the component's template
import { MessagesModule } from 'primeng/messages';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

// Mock ActivatedRoute
const mockActivatedRoute = {
  snapshot: {}, // Or provide specific snapshot data if needed by component
  // Mock other properties/methods of ActivatedRoute if used by the component
};

describe('DireccionListComponent', () => {
  let component: DireccionListComponent;
  let fixture: ComponentFixture<DireccionListComponent>;
  let mockDireccionEnvioService: jasmine.SpyObj<DireccionEnvioService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockDirecciones: DireccionEnvio[] = [
    { id: 1, usuarioId: 1, calle: 'Calle Falsa 123', ciudad: 'Springfield', cp: '12345', pais: 'USA', predeterminada: true },
    { id: 2, usuarioId: 1, calle: 'Avenida Siempreviva 742', ciudad: 'Springfield', cp: '67890', pais: 'USA', predeterminada: false }
  ];

  beforeEach(async () => {
    mockDireccionEnvioService = jasmine.createSpyObj('DireccionEnvioService', ['getDirecciones', 'eliminarDireccion', 'actualizarDireccion']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        DireccionListComponent, // Import standalone component
        RouterTestingModule,    // For routerLink, navigate, etc.
        HttpClientTestingModule, // Service might still be provided, though mocked here
        // Import PrimeNG modules used by the component
        MessagesModule,
        TableModule,
        ButtonModule,
        TagModule,
        TooltipModule
      ],
      providers: [
        { provide: DireccionEnvioService, useValue: mockDireccionEnvioService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DireccionListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit and cargarDirecciones', () => {
    it('should call cargarDirecciones on init and load addresses successfully', () => {
      mockDireccionEnvioService.getDirecciones.and.returnValue(of(mockDirecciones));

      fixture.detectChanges(); // Triggers ngOnInit

      expect(mockDireccionEnvioService.getDirecciones).toHaveBeenCalled();
      expect(component.direcciones.length).toBe(2);
      expect(component.direcciones).toEqual(mockDirecciones);
      expect(component.isLoading).toBeFalse();
      expect(component.msgs.length).toBe(0);
    });

    it('should handle error when loading addresses', () => {
      mockDireccionEnvioService.getDirecciones.and.returnValue(throwError(() => new Error('Test error')));

      fixture.detectChanges(); // Triggers ngOnInit

      expect(mockDireccionEnvioService.getDirecciones).toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
      expect(component.msgs.length).toBe(1);
      expect(component.msgs[0].severity).toBe('error');
      expect(component.msgs[0].detail).toContain('Error al cargar las direcciones');
    });
  });

  describe('agregarNuevaDireccion', () => {
    it('should navigate to "nueva" route', () => {
      component.agregarNuevaDireccion();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['nueva'], { relativeTo: mockActivatedRoute as any });
    });
  });

  describe('editarDireccion', () => {
    it('should navigate to "editar/:id" route', () => {
      const addressId = 1;
      component.editarDireccion(addressId);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['editar', addressId], { relativeTo: mockActivatedRoute as any });
    });
  });

  describe('eliminarDireccion', () => {
    beforeEach(() => {
      // Mock window.confirm to always return true for these tests
      spyOn(window, 'confirm').and.returnValue(true);
      // Resetting spy calls for getDirecciones before each test in this describe block
      mockDireccionEnvioService.getDirecciones.calls.reset();
      mockDireccionEnvioService.getDirecciones.and.returnValue(of(mockDirecciones)); // For reload
    });

    it('should call service.eliminarDireccion and reload addresses on success', fakeAsync(() => {
      mockDireccionEnvioService.eliminarDireccion.and.returnValue(of(void 0));

      component.eliminarDireccion(1);
      tick();

      expect(mockDireccionEnvioService.eliminarDireccion).toHaveBeenCalledWith(1);
      expect(component.msgs.length).toBe(1);
      expect(component.msgs[0].severity).toBe('success');
      expect(mockDireccionEnvioService.getDirecciones).toHaveBeenCalledTimes(1); // Called by cargarDirecciones
    }));

    it('should display error message on service.eliminarDireccion failure', fakeAsync(() => {
      mockDireccionEnvioService.eliminarDireccion.and.returnValue(throwError(() => new Error('Delete error')));

      component.eliminarDireccion(1);
      tick();

      expect(mockDireccionEnvioService.eliminarDireccion).toHaveBeenCalledWith(1);
      expect(component.isLoading).toBeFalse();
      expect(component.msgs.length).toBe(1);
      expect(component.msgs[0].severity).toBe('error');
      expect(component.msgs[0].detail).toContain('Error al eliminar la dirección');
    }));

    it('should not call service.eliminarDireccion if confirm is false', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);
      component.eliminarDireccion(1);
      expect(mockDireccionEnvioService.eliminarDireccion).not.toHaveBeenCalled();
    });
  });

  describe('marcarComoPredeterminada', () => {
    beforeEach(() => {
       mockDireccionEnvioService.getDirecciones.calls.reset();
       mockDireccionEnvioService.getDirecciones.and.returnValue(of(mockDirecciones));
    });

    it('should not call service if address is already default', () => {
      const defaultAddress = { ...mockDirecciones[0], predeterminada: true };
      component.marcarComoPredeterminada(defaultAddress);
      expect(mockDireccionEnvioService.actualizarDireccion).not.toHaveBeenCalled();
      expect(component.msgs.length).toBe(1);
      expect(component.msgs[0].severity).toBe('info');
    });

    it('should call service.actualizarDireccion and reload on success', fakeAsync(() => {
      const nonDefaultAddress = { ...mockDirecciones[1], predeterminada: false };
      mockDireccionEnvioService.actualizarDireccion.and.returnValue(of({ ...nonDefaultAddress, predeterminada: true }));

      component.marcarComoPredeterminada(nonDefaultAddress);
      tick();

      expect(mockDireccionEnvioService.actualizarDireccion).toHaveBeenCalledWith(nonDefaultAddress.id, { predeterminada: true });
      expect(component.msgs.length).toBe(1);
      expect(component.msgs[0].severity).toBe('success');
      expect(mockDireccionEnvioService.getDirecciones).toHaveBeenCalledTimes(1);
    }));

    it('should display error message on service.actualizarDireccion failure', fakeAsync(() => {
      const nonDefaultAddress = { ...mockDirecciones[1], predeterminada: false };
      mockDireccionEnvioService.actualizarDireccion.and.returnValue(throwError(() => new Error('Update error')));

      component.marcarComoPredeterminada(nonDefaultAddress);
      tick();

      expect(mockDireccionEnvioService.actualizarDireccion).toHaveBeenCalledWith(nonDefaultAddress.id, { predeterminada: true });
      expect(component.isLoading).toBeFalse();
      expect(component.msgs.length).toBe(1);
      expect(component.msgs[0].severity).toBe('error');
      expect(component.msgs[0].detail).toContain('Error al marcar como predeterminada');
    }));
  });
});
