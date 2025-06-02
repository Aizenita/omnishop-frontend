import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Added
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { DireccionEnvio } from '../../../../shared/models/direccion-envio.model';
import { DireccionEnvioService } from '../../../../shared/services/direccion-envio.service';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table'; // Added for p-table
import { MessagesModule } from 'primeng/messages'; // Added for p-messages
import { Message } from 'primeng/api'; // For Message type
import { TagModule } from 'primeng/tag'; // Added for p-tag
import { TooltipModule } from 'primeng/tooltip'; // For button tooltips

@Component({
  selector: 'app-direccion-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    RippleModule,
    TableModule,      // Added
    MessagesModule,   // Added
    TagModule,        // Added
    TooltipModule     // Added
  ],
  templateUrl: './direccion-list.component.html',
  styleUrls: ['./direccion-list.component.scss']
})
export class DireccionListComponent implements OnInit {
  direcciones: DireccionEnvio[] = [];
  isLoading = false;
  // error: string | null = null; // Will use msgs for errors
  msgs: Message[] = [];

  constructor(
    private direccionService: DireccionEnvioService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.cargarDirecciones();
  }

  cargarDirecciones(): void {
    this.isLoading = true;
    this.msgs = []; // Clear previous messages
    this.direccionService.getDirecciones().subscribe({
      next: (data) => {
        this.direcciones = data;
        this.isLoading = false;
      },
      error: (err) => {
        // this.error = 'Error al cargar las direcciones. Intente más tarde.';
        this.msgs = [{severity:'error', summary:'Error', detail:'Error al cargar las direcciones. Intente más tarde.'}];
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
    // Future: Replace confirm with p-confirmDialog
    if (confirm('¿Está seguro de que desea eliminar esta dirección?')) {
      this.isLoading = true; 
      this.msgs = [];
      this.direccionService.eliminarDireccion(id).subscribe({
        next: () => {
          this.msgs = [{severity:'success', summary:'Eliminada', detail:'Dirección eliminada correctamente.'}];
          this.cargarDirecciones(); 
        },
        error: (err) => {
          // this.error = 'Error al eliminar la dirección.';
          this.msgs = [{severity:'error', summary:'Error', detail:'Error al eliminar la dirección.'}];
          console.error('Error deleting address:', err);
          this.isLoading = false; 
        }
      });
    }
  }

  marcarComoPredeterminada(direccion: DireccionEnvio): void {
    if (direccion.predeterminada) {
      this.msgs = [{severity:'info', summary:'Información', detail:'Esta dirección ya es la predeterminada.'}];
      return;
    }
    this.isLoading = true; 
    this.msgs = [];
    this.direccionService.actualizarDireccion(direccion.id, { predeterminada: true }).subscribe({
      next: () => {
        this.msgs = [{severity:'success', summary:'Actualizada', detail:'Dirección marcada como predeterminada.'}];
        this.cargarDirecciones(); 
      },
      error: (err) => {
        // this.error = 'Error al marcar como predeterminada.';
        this.msgs = [{severity:'error', summary:'Error', detail:'Error al marcar como predeterminada.'}];
        console.error('Error setting default address:', err);
        this.isLoading = false;
      }
    });
  }
}
