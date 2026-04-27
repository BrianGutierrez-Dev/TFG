import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="flex items-center justify-between mb-7 pb-5 border-b border-gray-100">
      <div>
        <h1 class="text-xl font-semibold text-gray-900 tracking-tight">{{ title }}</h1>
        @if (subtitle) {
          <p class="text-sm text-gray-400 mt-0.5">{{ subtitle }}</p>
        }
      </div>
      <div class="flex items-center gap-2">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
