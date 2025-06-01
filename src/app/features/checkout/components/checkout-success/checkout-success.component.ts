import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router'; // RouterModule for routerLink
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
// import { OrderService } from '../../../shared/services/order.service'; // Future: To get order details

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule],
  templateUrl: './checkout-success.component.html',
  styleUrls: ['./checkout-success.component.scss']
})
export class CheckoutSuccessComponent implements OnInit {
  orderId: string | null = null;
  // orderDetails: any = null; // Future: To store fetched order details
  // isLoading: boolean = false;

  constructor(private route: ActivatedRoute /*, private orderService: OrderService */) { }

  ngOnInit(): void {
    // Example: Try to get orderId if backend redirects with it
    // this.orderId = this.route.snapshot.queryParamMap.get('orderId');
    // if (this.orderId) {
    //   this.fetchOrderDetails(this.orderId);
    // } else {
    //   // Or retrieve from session storage if stored before Redsys redirect
    // }
    console.log('Checkout Success Page Loaded.');
    // For now, just a static message. Real implementation should verify order status.
  }

  // fetchOrderDetails(orderId: string): void {
  //   this.isLoading = true;
  //   // this.orderService.getOrder(orderId).subscribe(details => {
  //   //   this.orderDetails = details;
  //   //   this.isLoading = false;
  //   // }, error => {
  //   //   console.error('Error fetching order details', error);
  //   //   this.isLoading = false;
  //   // });
  // }
}
