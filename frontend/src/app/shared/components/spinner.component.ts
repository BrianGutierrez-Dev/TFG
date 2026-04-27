import { Component, Input } from '@angular/core';
import { LucideAngularModule, Loader2 } from 'lucide-angular';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="flex flex-col items-center justify-center py-24 text-gray-400">
      <lucide-icon [img]="Loader2" [size]="32" class="animate-spin mb-3"></lucide-icon>
      <p class="text-sm">{{ text }}</p>
    </div>
  `,
})
export class SpinnerComponent {
  @Input() text = 'Cargando...';
  readonly Loader2 = Loader2;
}
