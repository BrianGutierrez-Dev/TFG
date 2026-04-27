import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="pt-14 min-h-screen bg-gray-50">
      <div class="max-w-screen-xl mx-auto px-6 py-6">
        <router-outlet></router-outlet>
      </div>
    </main>
  `,
})
export class LayoutComponent {}
