export interface PagoItemDto {
  productoId: number;
  cantidad: number;
}

export interface IniciarPagoRequestDto {
  shippingAddressId: number;
  items: PagoItemDto[];
  totalAmount: number;
}
