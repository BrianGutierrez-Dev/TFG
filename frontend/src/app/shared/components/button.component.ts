import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LucideAngularModule, Loader2 } from 'lucide-angular';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClass"
      (click)="clicked.emit($event)"
    >
      @if (loading) {
        <lucide-icon [img]="Loader2" [size]="14" class="animate-spin"></lucide-icon>
      }
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'warning' = 'primary';
  @Input() size: 'sm' | 'md' = 'md';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() extraClass = '';
  @Output() clicked = new EventEmitter<MouseEvent>();

  readonly Loader2 = Loader2;

  private readonly variants: Record<string, string> = {
    primary:   'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    success:   'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300',
    warning:   'bg-amber-500 text-white hover:bg-amber-600 disabled:bg-amber-300',
    danger:    'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    ghost:     'text-gray-600 hover:bg-gray-100',
  };

  private readonly sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
  };

  get buttonClass(): string {
    return `inline-flex items-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${this.variants[this.variant]} ${this.sizes[this.size]} ${this.extraClass}`;
  }
}
