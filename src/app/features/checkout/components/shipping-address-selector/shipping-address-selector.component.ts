import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // RouterModule for routerLink
import { Observable, of } from 'rxjs';
import { DireccionEnvio } from '../../../../shared/models/direccion-envio.model';
import { DireccionEnvioService } from '../../../../shared/services/direccion-envio.service';

// PrimeNG Modules
import { CardModule } from 'primeng/card'; // Or PanelModule
import { DataViewModule } from 'primeng/dataview'; // For displaying addresses
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag'; // To show 'Predeterminada'
import { RadioButtonModule } from 'primeng/radiobutton'; // For selection
import { FormsModule } from '@angular/forms'; // For ngModel with p-radioButton

@Component({
  selector: 'app-shipping-address-selector',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // For routerLink
    FormsModule,  // For ngModel
    CardModule,
    DataViewModule,
    ButtonModule,
    TagModule,
    RadioButtonModule
  ],
  templateUrl: './shipping-address-selector.component.html',
  styleUrls: ['./shipping-address-selector.component.scss']
})
export class ShippingAddressSelectorComponent implements OnInit {
  addresses$: Observable<DireccionEnvio[]> = of([]);
  selectedAddress: DireccionEnvio | null = null;
  isLoading = false;

  @Output() addressSelected = new EventEmitter<DireccionEnvio>();

  constructor(
    private direccionEnvioService: DireccionEnvioService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.isLoading = true;
    this.addresses$ = this.direccionEnvioService.getDirecciones();
    // Auto-select default address
    this.addresses$.subscribe(addresses => {
      const defaultAddress = addresses.find(addr => addr.predeterminada);
      if (defaultAddress) {
        this.selectAddress(defaultAddress);
      } else if (addresses.length > 0) {
        // If no default, select the first one by default? Or none?
        // For now, select first if no default.
        // this.selectAddress(addresses[0]);
      }
      this.isLoading = false;
    }, error => {
      console.error('Error loading addresses for checkout', error);
      this.isLoading = false;
      // Handle error display if needed
    });
  }

  selectAddress(address: DireccionEnvio): void {
    this.selectedAddress = address;
    this.addressSelected.emit(this.selectedAddress);
    console.log('Selected address:', this.selectedAddress);
  }

  addNewAddress(): void {
    // Navigate to the address creation form.
    // We might want to pass a return URL so the form redirects back to checkout.
    this.router.navigate(['/profile/direcciones/nueva'], { queryParams: { returnUrl: '/checkout' } });
  }

  // Helper to identify an address, e.g. for p-radioButton model comparison
  trackByAddressId(index: number, address: DireccionEnvio): number {
    return address.id;
  }
}
