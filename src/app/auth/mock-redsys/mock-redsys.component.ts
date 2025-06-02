import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-mock-redsys',
  standalone: true,
  template: `
    <div class="mock-container">
      <h2>💳 TPV Redsys</h2>
      <p><strong>Pedido:</strong> {{ order }}</p>
      <p><strong>Importe:</strong> {{ amount / 100 }} €</p>
      <button (click)="confirmarPago()">Confirmar Pago</button>
      <button (click)="cancelarPago()">Cancelar</button>
    </div>
  `,
  styles: [`
    .mock-container { padding: 2rem; text-align: center; }
    button { margin: 1rem; padding: 1rem 2rem; }
  `]
})
export class MockRedsysComponent implements OnInit {
  order: string = '';
  amount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const params = new URLSearchParams(history.state.params);
    const merchantParams = JSON.parse(atob(params.get('Ds_MerchantParameters') || '{}'));
    this.order = merchantParams.DS_MERCHANT_ORDER || '000000000001';
    this.amount = parseInt(merchantParams.DS_MERCHANT_AMOUNT || '0');
  }

  confirmarPago(): void {
    const body = new HttpParams().set('Ds_Order', this.order);
    this.http.post('http://localhost:8080/api/pago/notificacion', body)
      .subscribe(() => this.router.navigate(['/pago-ok']));
  }

  cancelarPago(): void {
    this.router.navigate(['/pago-ko']);
  }
}
