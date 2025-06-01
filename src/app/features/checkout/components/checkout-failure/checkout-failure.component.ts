import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-checkout-failure',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule],
  templateUrl: './checkout-failure.component.html',
  styleUrls: ['../checkout-success/checkout-success.component.scss'] // Share styles
})
export class CheckoutFailureComponent implements OnInit {
  errorCode: string | null = null;
  orderId: string | null = null;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Example: Redsys might return Ds_ErrorCode in query params on KO URL
    // this.errorCode = this.route.snapshot.queryParamMap.get('Ds_ErrorCode');
    // this.orderId = this.route.snapshot.queryParamMap.get('orderId'); // If backend passes it
    console.log('Checkout Failure Page Loaded.');
    // For now, just a static message.
  }
}
