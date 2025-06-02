import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // RouterModule for routerLink
import { Subscription, timer } from 'rxjs';
import { take } from 'rxjs/operators';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-order-confirmed',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule
  ],
  templateUrl: './order-confirmed.component.html',
  styleUrls: ['./order-confirmed.component.scss']
})
export class OrderConfirmedComponent implements OnInit, OnDestroy {
  orderId: string | null = null;
  countdown: number = 5; // Seconds for redirect
  private timerSubscription: Subscription | undefined;
  private countdownSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('orderId');
    this.startRedirectTimer();
  }

  startRedirectTimer(): void {
    this.timerSubscription = timer(this.countdown * 1000).subscribe(() => {
      this.navigateToHome();
    });

    this.countdownSubscription = timer(0, 1000).pipe(take(this.countdown + 1)).subscribe(() => {
      if (this.countdown > 0) {
        this.countdown--;
      }
    });
  }

  navigateToHome(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }
}
