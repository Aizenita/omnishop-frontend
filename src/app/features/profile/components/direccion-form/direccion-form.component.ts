import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DireccionEnvioService } from '../../../../shared/services/direccion-envio.service';
import { DireccionEnvio } from '../../../../shared/models/direccion-envio.model';
import { DireccionEnvioRequest } from '../../../../shared/models/direccion-envio-request.model';
import { DireccionEnvioUpdate } from '../../../../shared/models/direccion-envio-update.model';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-direccion-form',
  templateUrl: './direccion-form.component.html',
  styleUrls: ['./direccion-form.component.scss']
})
export class DireccionFormComponent implements OnInit {
  direccionForm: FormGroup;
  isEditMode = false;
  direccionId: number | null = null;
  isLoading = false;
  error: string | null = null;
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
      cp: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]], // Basic 5-digit ZIP
      pais: ['', Validators.required],
      predeterminada: [false]
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
          // For now, let's try to get it from the list of addresses (if available) or mock it.
          // A proper implementation would fetch the single address.
          // The provided service has getDirecciones(), not getDireccion(id).
          // So, for edit, we'd need to pass data or enhance service.
          // For now, I'll prepare the form and load data if DireccionEnvioService had getDireccion(id).
          // Since it doesn't, I'll log a warning.
          if (this.direccionService.getDirecciones) { // Check if method exists
             return this.direccionService.getDirecciones(); // This is not ideal, should be getDireccion(id)
          } else {
             console.warn('DireccionService.getDireccion(id) not implemented. Form may not load existing data for edit.');
             return of(null); // Return an observable of null
          }
        }
        return of(null); // Not in edit mode
      })
    ).subscribe(data => {
      // If data is DireccionEnvio[] from getDirecciones (the non-ideal case)
      if (this.isEditMode && Array.isArray(data) && this.direccionId) {
        const addressToEdit = data.find(d => d.id === this.direccionId);
        if (addressToEdit) {
          this.direccionForm.patchValue(addressToEdit);
        } else {
          this.error = 'Dirección no encontrada para editar.';
          console.error('Address not found for ID:', this.direccionId);
        }
      }
      // If data is DireccionEnvio (ideal case from a getDireccion(id) method)
      // else if (this.isEditMode && data) {
      //   this.direccionForm.patchValue(data);
      // }
      this.isLoading = false;
    }, err => {
      this.error = 'Error al cargar los datos de la dirección.';
      this.isLoading = false;
      console.error('Error loading address data:', err);
    });
  }

  get calle() { return this.direccionForm.get('calle'); }
  get ciudad() { return this.direccionForm.get('ciudad'); }
  get cp() { return this.direccionForm.get('cp'); }
  get pais() { return this.direccionForm.get('pais'); }

  guardarDireccion(): void {
    if (this.direccionForm.invalid) {
      this.direccionForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;

    const formValue = this.direccionForm.value;

    if (this.isEditMode && this.direccionId) {
      const updateData: DireccionEnvioUpdate = {
        calle: formValue.calle,
        ciudad: formValue.ciudad,
        cp: formValue.cp,
        pais: formValue.pais,
        predeterminada: formValue.predeterminada
      };
      this.direccionService.actualizarDireccion(this.direccionId, updateData).subscribe({
        next: () => this.router.navigate(['../'], { relativeTo: this.route }), // UPDATED
        error: (err) => {
          this.error = 'Error al actualizar la dirección.';
          console.error('Error updating address:', err);
          this.isLoading = false;
        }
      });
    } else {
      // For 'crear', DireccionEnvioRequest might need usuarioId.
      // The backend DTO DireccionEnvioRequestDto has usuarioId.
      // However, this should ideally be handled by the backend using the authenticated user.
      // If the backend *requires* it from frontend, it's a potential security concern.
      // For now, assuming backend can derive it or it's optional from frontend.
      const requestData: DireccionEnvioRequest = {
        calle: formValue.calle,
        ciudad: formValue.ciudad,
        cp: formValue.cp,
        pais: formValue.pais,
        predeterminada: formValue.predeterminada
        // usuarioId: ... // If needed, get from auth service
      };
      this.direccionService.crearDireccion(requestData).subscribe({
        next: () => this.router.navigate(['../'], { relativeTo: this.route }), // UPDATED
        error: (err) => {
          this.error = 'Error al crear la dirección.';
          console.error('Error creating address:', err);
          this.isLoading = false;
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['../'], { relativeTo: this.route }); // UPDATED
  }
}
