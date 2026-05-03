import { Component, inject } from '@angular/core';
import { LucideAngularModule, CheckCircle2, AlertCircle, Info, X } from 'lucide-angular';
import { ToastService, Toast } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [LucideAngularModule],
  styles: [`
    @keyframes toast-in {
      from { opacity: 0; transform: translateX(1.5rem); }
      to   { opacity: 1; transform: translateX(0); }
    }
    .toast-item { animation: toast-in 0.2s ease-out; }
  `],
  template: `
    <div class="fixed bottom-5 right-5 z-50 flex flex-col-reverse gap-2 pointer-events-none">
      @for (t of toastService.toasts(); track t.id) {
        <div [class]="toastClass(t)" class="toast-item">
          <lucide-icon [img]="iconFor(t.type)" [size]="15" class="flex-shrink-0"></lucide-icon>
          <span class="flex-1 leading-snug">{{ t.message }}</span>
          <button (click)="toastService.dismiss(t.id)"
                  class="opacity-60 hover:opacity-100 transition-opacity ml-1 pointer-events-auto">
            <lucide-icon [img]="X" [size]="13"></lucide-icon>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  toastService = inject(ToastService);

  readonly X = X;
  private readonly CheckCircle2 = CheckCircle2;
  private readonly AlertCircle = AlertCircle;
  private readonly InfoIcon = Info;

  toastClass(t: Toast): string {
    const base = 'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto min-w-64 max-w-sm';
    const color = t.type === 'success' ? 'bg-gray-900 text-white'
                : t.type === 'error'   ? 'bg-red-600 text-white'
                                       : 'bg-blue-600 text-white';
    return `${base} ${color}`;
  }

  iconFor(type: Toast['type']) {
    return type === 'success' ? this.CheckCircle2
         : type === 'error'   ? this.AlertCircle
                              : this.InfoIcon;
  }
}
