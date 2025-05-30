import { Component, OnInit } from '@angular/core';
import { DireccionEnvio } from '../../../../shared/models/direccion-envio.model';
import { DireccionEnvioService } from '../../../../shared/services/direccion-envio.service';
import { Router, ActivatedRoute } from '@angular/router'; // Make sure ActivatedRoute is imported

@Component({
  selector: 'app-direccion-list',
  templateUrl: './direccion-list.component.html',
  styleUrls: ['./direccion-list.component.scss']
})
export class DireccionListComponent implements OnInit {
  direcciones: DireccionEnvio[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private direccionService: DireccionEnvioService,
    private router: Router, // Ensure Router is injected
    private route: ActivatedRoute // Ensure ActivatedRoute is injected
  ) { }

  ngOnInit(): void {
    this.cargarDirecciones();
  }

  cargarDirecciones(): void {
    this.isLoading = true;
    this.error = null;
    this.direccionService.getDirecciones().subscribe({
      next: (data) => {
        this.direcciones = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las direcciones. Intente más tarde.';
        console.error('Error fetching addresses:', err);
        this.isLoading = false;
      }
    });
  }

  agregarNuevaDireccion(): void {
    this.router.navigate(['nueva'], { relativeTo: this.route });
  }

  editarDireccion(id: number): void {
    this.router.navigate(['editar', id], { relativeTo: this.route });
  }

  eliminarDireccion(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar esta dirección?')) {
      this.isLoading = true; // Or a specific loading state for delete
      this.direccionService.eliminarDireccion(id).subscribe({
        next: () => {
          this.cargarDirecciones(); // Refresh the list
        },
        error: (err) => {
          this.error = 'Error al eliminar la dirección.';
          console.error('Error deleting address:', err);
          this.isLoading = false; // Reset general loading if it was set
        }
      });
    }
  }

  marcarComoPredeterminada(direccion: DireccionEnvio): void {
    if (direccion.predeterminada) {
      console.log('Esta dirección ya es la predeterminada.');
      return;
    }

    // Create an update DTO with only the predeterminada flag
    const updateData = { ...direccion, predeterminada: true };

    // All other addresses should be set to not predeterminada
    // This logic might be complex: either backend handles it atomically
    // or frontend sends multiple updates.
    // For now, assume backend makes this the only default.

    this.isLoading = true;
    this.direccionService.actualizarDireccion(direccion.id, { predeterminada: true }).subscribe({
      next: () => {
        // If backend doesn't automatically unmark others, we might need to reload all or manually update UI
        this.cargarDirecciones();
      },
      error: (err) => {
        this.error = 'Error al marcar como predeterminada.';
        console.error('Error setting default address:', err);
        this.isLoading = false;
      }
    });
  }
}
