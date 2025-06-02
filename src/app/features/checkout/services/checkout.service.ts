import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IniciarPagoRequestDto } from '../../../shared/models/iniciar-pago-request.dto';
import { RedsysParamsDto } from '../../../shared/models/redsys-params.dto';

@Injectable({
  providedIn: 'root'
  // Or provide in CheckoutComponent if only used there,
  // but 'root' is fine for a feature-specific service like this.
})
export class CheckoutService {
  private apiUrl = '/api/checkout'; // Base URL for checkout related endpoints

  constructor(private http: HttpClient) { }

  iniciarPagoRedsys(payload: IniciarPagoRequestDto): Observable<RedsysParamsDto> {
    return this.http.post<RedsysParamsDto>(`${this.apiUrl}/iniciar-pago`, payload);
  }
}
