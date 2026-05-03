import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { ToastComponent } from '../shared/components/toast.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="pt-14 min-h-screen bg-gradient-to-br from-gray-100 to-gray-50">
      <div class="px-6 py-6">
        <router-outlet></router-outlet>
      </div>
    </main>
    <app-toast></app-toast>
  `,
})
export class LayoutComponent {}
