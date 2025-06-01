import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Added
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Added ReactiveFormsModule
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DireccionEnvioService } from '../../../../shared/services/direccion-envio.service';
import { DireccionEnvio } from '../../../../shared/models/direccion-envio.model';
import { DireccionEnvioRequest } from '../../../../shared/models/direccion-envio-request.model';
import { DireccionEnvioUpdate } from '../../../../shared/models/direccion-envio-update.model';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple'; // Often used with buttons
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MessagesModule } from 'primeng/messages'; // For global messages
import { Message } from 'primeng/api'; // For Message type
// p-message for individual field errors does not require a separate module import if MessageModule is already there for p-messages
// However, if only p-message (small ones) are used, then only MessageModule is needed.
// Let's ensure MessagesModule for p-messages (plural) for global errors.

@Component({
  selector: 'app-direccion-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    RippleModule,
    InputTextModule,
    CheckboxModule,
    MessagesModule // For p-messages (plural)
  ],
  templateUrl: './direccion-form.component.html',
  styleUrls: ['./direccion-form.component.scss']
})
export class DireccionFormComponent implements OnInit {
  direccionForm: FormGroup;
  isEditMode = false;
  direccionId: number | null = null;
  isLoading = false;
  // error: string | null = null; // Replaced by msgs
  msgs: Message[] = [];
  pageTitle = 'Nueva Dirección';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private direccionService: DireccionEnvioService
  ) {
    this.direccionForm = this.fb.group({
      calle: ['', Validators.required],
      ciudad: ['', Validators.required],
      cp: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      pais: ['', Validators.required],
      predeterminada: [false] // p-checkbox binds to boolean
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isEditMode = true;
          this.direccionId = +id;
          this.pageTitle = 'Editar Dirección';
          this.isLoading = true;
          // Ideally, fetch the specific address if not passed in
          // For now, we rely on the getDirecciones from list or a dedicated getDireccion(id) if implemented
          // This example assumes we might need to fetch it:
          // return this.direccionService.getDireccion(this.direccionId);
          // If getDireccion(id) is not available or not preferred,
          // the component might expect the full DireccionEnvio object via route state or an @Input
          // For simplicity here, let's assume we might fetch or receive it.
          // If DireccionEnvioService does not have getDireccion(id), this needs adjustment.
              // Current service doesn't have getDireccion(id). This part needs review
              // if we want to load a single address for editing.
              // For now, it attempts to find it in the full list if getDirecciones() was used.
              // This logic to fetch for edit mode still needs a proper getDireccion(id) in service
              if (this.direccionService.getDirecciones) {
                 return this.direccionService.getDirecciones();
              } else {
                 this.msgs = [{severity:'warn', summary:'Advertencia', detail:'Servicio para cargar dirección individual no implementado.'}];
                 return of(null);
              }
            }
            return of(null);
          })
        ).subscribe(data => {
          if (this.isEditMode && Array.isArray(data) && this.direccionId) {
            const addressToEdit = data.find(d => d.id === this.direccionId);
            if (addressToEdit) {
              this.direccionForm.patchValue(addressToEdit);
            } else {
              this.msgs = [{severity:'error', summary:'Error', detail:'Dirección no encontrada para editar.'}];
            }
          }
          this.isLoading = false;
        }, err => {
          this.msgs = [{severity:'error', summary:'Error', detail:'Error al cargar los datos de la dirección.'}];
          this.isLoading = false;
        });
  }

  get f() { return this.direccionForm.controls; } // Helper for easier access in template

  guardarDireccion(): void {
    this.msgs = [];
    if (this.direccionForm.invalid) {
      this.direccionForm.markAllAsTouched();
      this.msgs = [{severity:'error', summary:'Error de Validación', detail:'Por favor, corrija los errores en el formulario.'}];
      return;
    }

    this.isLoading = true;
    const formValue = this.direccionForm.value;

    if (this.isEditMode && this.direccionId) {
      const updateData: DireccionEnvioUpdate = { ...formValue };
      this.direccionService.actualizarDireccion(this.direccionId, updateData).subscribe({
        next: () => this.router.navigate(['../'], { relativeTo: this.route }), // Add success message via NavigationExtras state if needed
        error: (err) => {
          this.msgs = [{severity:'error', summary:'Error', detail:'Error al actualizar la dirección.'}];
          this.isLoading = false;
        }
      });
    } else {
      const requestData: DireccionEnvioRequest = { ...formValue };
      this.direccionService.crearDireccion(requestData).subscribe({
        next: () => this.router.navigate(['../'], { relativeTo: this.route }), // Add success message via NavigationExtras state if needed
        error: (err) => {
          this.msgs = [{severity:'error', summary:'Error', detail:'Error al crear la dirección.'}];
          this.isLoading = false;
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
