import { Component, inject, signal, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, ShieldAlert, LayoutDashboard, Users, FileText, AlertTriangle, Car, Wrench, Hammer, UserCog, LogOut, ChevronDown } from 'lucide-angular';
import { AuthService } from '../core/services/auth.service';
import { ClientsService } from '../core/services/clients.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <header class="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-40 flex items-center px-6 gap-4">
      <!-- Logo -->
      <a routerLink="/" class="flex items-center gap-2.5 mr-4 flex-shrink-0">
        <div class="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
          <lucide-icon [img]="ShieldAlert" [size]="15" class="text-white"></lucide-icon>
        </div>
        <span class="font-bold text-gray-900 text-sm tracking-wide">BlackList</span>
      </a>

      <!-- Nav items -->
      <nav class="flex items-center gap-0.5 flex-1">
        <a routerLink="/" routerLinkActive="bg-gray-100 text-gray-900" [routerLinkActiveOptions]="{exact:true}"
           class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-gray-500 hover:text-gray-900 hover:bg-gray-50">
          <lucide-icon [img]="LayoutDashboard" [size]="15"></lucide-icon>
          Panel
        </a>

        <a routerLink="/blacklist" routerLinkActive="!bg-red-600 !text-white"
           class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors text-red-600 hover:bg-red-600 hover:text-white">
          <lucide-icon [img]="ShieldAlert" [size]="15"></lucide-icon>
          Blacklist
          @if (blacklistedCount() > 0) {
            <span class="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[18px] text-center">
              {{ blacklistedCount() }}
            </span>
          }
        </a>

        <div class="w-px h-5 bg-gray-200 mx-1"></div>

        <a routerLink="/clients" routerLinkActive="bg-gray-100 text-gray-900"
           class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-gray-500 hover:text-gray-900 hover:bg-gray-50">
          <lucide-icon [img]="Users" [size]="15"></lucide-icon>
          Clientes
        </a>
        <a routerLink="/rentals" routerLinkActive="bg-gray-100 text-gray-900"
           class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-gray-500 hover:text-gray-900 hover:bg-gray-50">
          <lucide-icon [img]="FileText" [size]="15"></lucide-icon>
          Contratos
        </a>
        <a routerLink="/incidents" routerLinkActive="bg-gray-100 text-gray-900"
           class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-gray-500 hover:text-gray-900 hover:bg-gray-50">
          <lucide-icon [img]="AlertTriangle" [size]="15"></lucide-icon>
          Incidencias
        </a>
        <a routerLink="/cars" routerLinkActive="bg-gray-100 text-gray-900"
           class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-gray-500 hover:text-gray-900 hover:bg-gray-50">
          <lucide-icon [img]="Car" [size]="15"></lucide-icon>
          Vehículos
        </a>

        <!-- Taller dropdown -->
        <div class="relative" #tallerRef>
          <button (click)="tallerOpen.set(!tallerOpen())"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
            <lucide-icon [img]="Wrench" [size]="15"></lucide-icon>
            Taller
            <lucide-icon [img]="ChevronDown" [size]="13" [class]="tallerOpen() ? 'rotate-180 transition-transform' : 'transition-transform'"></lucide-icon>
          </button>
          @if (tallerOpen()) {
            <div class="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-48 z-50">
              <a routerLink="/maintenances" (click)="tallerOpen.set(false)"
                 class="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                <lucide-icon [img]="Wrench" [size]="14"></lucide-icon>
                Mantenimiento
              </a>
              <a routerLink="/repairs" (click)="tallerOpen.set(false)"
                 class="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                <lucide-icon [img]="Hammer" [size]="14"></lucide-icon>
                Reparaciones
              </a>
            </div>
          }
        </div>

        @if (auth.isAdmin()) {
          <div class="relative" #adminRef>
            <button (click)="adminOpen.set(!adminOpen())"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
              <lucide-icon [img]="UserCog" [size]="15"></lucide-icon>
              Admin
              <lucide-icon [img]="ChevronDown" [size]="13" [class]="adminOpen() ? 'rotate-180 transition-transform' : 'transition-transform'"></lucide-icon>
            </button>
            @if (adminOpen()) {
              <div class="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-48 z-50">
                <a routerLink="/employees" (click)="adminOpen.set(false)"
                   class="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <lucide-icon [img]="UserCog" [size]="14"></lucide-icon>
                  Empleados
                </a>
              </div>
            }
          </div>
        }
      </nav>

      <!-- User menu -->
      <div class="relative flex-shrink-0">
        <button (click)="userOpen.set(!userOpen())"
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
          <div class="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-semibold">
            {{ auth.employee()?.name?.charAt(0)?.toUpperCase() }}
          </div>
          <span class="text-sm font-medium text-gray-700">{{ auth.employee()?.name?.split(' ')?.[0] }}</span>
          <lucide-icon [img]="ChevronDown" [size]="13" [class]="userOpen() ? 'text-gray-400 rotate-180 transition-transform' : 'text-gray-400 transition-transform'"></lucide-icon>
        </button>

        @if (userOpen()) {
          <div class="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-44 z-50">
            <div class="px-4 py-2 border-b border-gray-100 mb-1">
              <p class="text-xs font-medium text-gray-900">{{ auth.employee()?.name }}</p>
              <p class="text-xs text-gray-400 capitalize">{{ auth.employee()?.role?.toLowerCase() }}</p>
            </div>
            <button (click)="logout()"
                    class="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <lucide-icon [img]="LogOut" [size]="14"></lucide-icon>
              Cerrar sesión
            </button>
          </div>
        }
      </div>
    </header>
  `,
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  private router = inject(Router);
  private clientsService = inject(ClientsService);

  readonly ShieldAlert = ShieldAlert;
  readonly LayoutDashboard = LayoutDashboard;
  readonly Users = Users;
  readonly FileText = FileText;
  readonly AlertTriangle = AlertTriangle;
  readonly Car = Car;
  readonly Wrench = Wrench;
  readonly Hammer = Hammer;
  readonly UserCog = UserCog;
  readonly LogOut = LogOut;
  readonly ChevronDown = ChevronDown;

  tallerOpen = signal(false);
  adminOpen = signal(false);
  userOpen = signal(false);
  blacklistedCount = signal(0);

  constructor() {
    this.clientsService.getAll().subscribe({
      next: (clients) => {
        this.blacklistedCount.set(clients.filter(c => c.isBlacklisted).length);
      },
    });
  }

  logout() {
    this.auth.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('[class*="relative"]')) {
      this.tallerOpen.set(false);
      this.adminOpen.set(false);
      this.userOpen.set(false);
    }
  }
}
