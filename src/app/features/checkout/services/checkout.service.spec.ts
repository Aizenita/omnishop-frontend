import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CheckoutService } from './checkout.service';
// Import new DTOs
import { FinalizarPedidoRequestDto } from '../../../shared/models/finalizar-pedido-request.dto';
import { FinalizarPedidoResponseDto } from '../../../shared/models/finalizar-pedido-response.dto';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let httpMock: HttpTestingController;
  // Base API URL for this service
  const checkoutApiUrl = '/api/checkout'; 

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CheckoutService]
    });
    service = TestBed.inject(CheckoutService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('finalizarPedidoSimulado', () => {
    it('should call POST /api/checkout/finalizar-pedido-simulado and return FinalizarPedidoResponseDto', () => {
      const mockPayload: FinalizarPedidoRequestDto = {
        direccionEnvioId: 1,
        items: [{ productoId: 101, cantidad: 2 }],
        total: 59.99
      };
      const mockResponse: FinalizarPedidoResponseDto = {
        orderId: 12345,
        message: 'Pedido simulado realizado con éxito'
      };

      service.finalizarPedidoSimulado(mockPayload).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${checkoutApiUrl}/finalizar-pedido-simulado`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockPayload);
      req.flush(mockResponse);
    });
  });

  // Remove or comment out tests for iniciarPagoRedsys
  /*
  describe('iniciarPagoRedsys', () => {
    // ... old tests ...
  });
  */
});
