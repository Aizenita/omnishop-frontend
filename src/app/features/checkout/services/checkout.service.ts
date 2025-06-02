import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// Import new DTOs for simulated payment
import { FinalizarPedidoRequestDto } from '../../../shared/models/finalizar-pedido-request.dto';
import { FinalizarPedidoResponseDto } from '../../../shared/models/finalizar-pedido-response.dto';
// Remove DTOs related to Redsys if no longer used by other methods
// import { IniciarPagoRequestDto } from '../../../shared/models/iniciar-pago-request.dto'; // This might be different from FinalizarPedidoRequestDto
// import { RedsysParamsDto } from '../../../shared/models/redsys-params.dto'; // This was deleted

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private apiUrl = '/api/checkout';

  constructor(private http: HttpClient) { }

  // Method for simulated payment
  finalizarPedidoSimulado(payload: FinalizarPedidoRequestDto): Observable<FinalizarPedidoResponseDto> {
    return this.http.post<FinalizarPedidoResponseDto>(`${this.apiUrl}/finalizar-pedido-simulado`, payload);
  }

  /*
  // Comment out or remove Redsys method
  iniciarPagoRedsys(payload: IniciarPagoRequestDto): Observable<RedsysParamsDto> {
    return this.http.post<RedsysParamsDto>(`${this.apiUrl}/iniciar-pago`, payload);
  }
  */
}
