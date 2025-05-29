package com.springwebappsb.omnishop.enums;

public enum EstadoVenta {
    CARRITO_ACTIVO, // Carrito que el usuario está llenando
    PENDIENTE_PAGO, // Carrito confirmado, esperando pago
    PAGADA,         // Pago confirmado
    EN_PREPARACION, // Pedido en preparación
    ENVIADA,        // Pedido enviado
    ENTREGADA,      // Pedido entregado
    COMPLETADA,     // Pedido finalizado y archivado (opcional)
    CANCELADA       // Venta cancelada
}
