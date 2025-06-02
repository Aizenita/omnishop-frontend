import { PagoItemDto } from './iniciar-pago-request.dto'; // Assuming PagoItemDto is suitable

export interface FinalizarPedidoRequestDto {
  direccionEnvioId: number;
  items: PagoItemDto[];
  total: number; // Final total amount (including items, shipping, taxes)
}
