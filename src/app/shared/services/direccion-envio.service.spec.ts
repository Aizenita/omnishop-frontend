import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DireccionEnvioService } from './direccion-envio.service';
import { DireccionEnvio } from '../models/direccion-envio.model';
import { DireccionEnvioRequest } from '../models/direccion-envio-request.model';
import { DireccionEnvioUpdate } from '../models/direccion-envio-update.model';

describe('DireccionEnvioService', () => {
  let service: DireccionEnvioService;
  let httpMock: HttpTestingController;
  const apiUrl = '/api/direcciones';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DireccionEnvioService]
    });
    service = TestBed.inject(DireccionEnvioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Make sure that there are no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDirecciones', () => {
    it('should return an Observable<DireccionEnvio[]>', () => {
      const mockDirecciones: DireccionEnvio[] = [
        { id: 1, usuarioId: 1, calle: 'Calle Falsa 123', ciudad: 'Springfield', cp: '12345', pais: 'USA', predeterminada: true },
        { id: 2, usuarioId: 1, calle: 'Avenida Siempreviva 742', ciudad: 'Springfield', cp: '67890', pais: 'USA', predeterminada: false }
      ];

      service.getDirecciones().subscribe(direcciones => {
        expect(direcciones.length).toBe(2);
        expect(direcciones).toEqual(mockDirecciones);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockDirecciones);
    });
  });

  describe('crearDireccion', () => {
    it('should return an Observable<DireccionEnvio> for created address', () => {
      const requestData: DireccionEnvioRequest = { calle: 'Nueva Calle 1', ciudad: 'Ciudad Nueva', cp: '11111', pais: 'Nuevolandia', predeterminada: false, usuarioId: 1 };
      const mockCreatedDireccion: DireccionEnvio = { id: 3, ...requestData };

      service.crearDireccion(requestData).subscribe(direccion => {
        expect(direccion).toEqual(mockCreatedDireccion);
        expect(direccion.id).toBe(3);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(requestData);
      req.flush(mockCreatedDireccion);
    });
  });

  describe('actualizarDireccion', () => {
    it('should return an Observable<DireccionEnvio> for updated address', () => {
      const addressId = 1;
      const updateData: DireccionEnvioUpdate = { calle: 'Calle Falsa 123 Modificada', predeterminada: true };
      const mockUpdatedDireccion: DireccionEnvio = { 
        id: addressId, usuarioId: 1, calle: 'Calle Falsa 123 Modificada', ciudad: 'Springfield', cp: '12345', pais: 'USA', predeterminada: true 
      };

      service.actualizarDireccion(addressId, updateData).subscribe(direccion => {
        expect(direccion).toEqual(mockUpdatedDireccion);
        expect(direccion.calle).toBe('Calle Falsa 123 Modificada');
      });

      const req = httpMock.expectOne(`${apiUrl}/${addressId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockUpdatedDireccion);
    });
  });

  describe('eliminarDireccion', () => {
    it('should make a DELETE request to the correct URL', () => {
      const addressId = 1;

      service.eliminarDireccion(addressId).subscribe(response => {
        expect(response).toBeNull(); // Or undefined, or whatever void resolves to
      });

      const req = httpMock.expectOne(`${apiUrl}/${addressId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null); // Response for a void delete is typically null
    });
  });
});
