import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CheckoutService } from './checkout.service';
import { IniciarPagoRequestDto } from '../../../shared/models/iniciar-pago-request.dto';
import { RedsysParamsDto } from '../../../shared/models/redsys-params.dto';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let httpMock: HttpTestingController;
  const apiUrl = '/api/checkout/iniciar-pago-redsys';

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

  it('should call iniciarPagoRedsys and return RedsysParamsDto', () => {
    const mockPayload: IniciarPagoRequestDto = {
      shippingAddressId: 1,
      items: [{ productoId: 101, cantidad: 2 }],
      totalAmount: 59.99
    };
    const mockResponse: RedsysParamsDto = {
      redsysUrl: 'https://sis-t.redsys.es/sis/realizarPago',
      dsSignatureVersion: 'HMAC_SHA256_V1',
      dsMerchantParameters: 'paramsBase64...',
      dsSignature: 'signature...'
    };

    service.iniciarPagoRedsys(mockPayload).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockPayload);
    req.flush(mockResponse);
  });
});
