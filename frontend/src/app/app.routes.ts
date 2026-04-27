import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { BlacklistComponent } from './features/blacklist/blacklist.component';
import { ClientListComponent } from './features/clients/client-list.component';
import { CarListComponent } from './features/cars/car-list.component';
import { RentalListComponent } from './features/rentals/rental-list.component';
import { RentalDetailComponent } from './features/rentals/rental-detail.component';
import { IncidentListComponent } from './features/incidents/incident-list.component';
import { MaintenanceListComponent } from './features/maintenances/maintenance-list.component';
import { RepairListComponent } from './features/repairs/repair-list.component';
import { EmployeeListComponent } from './features/employees/employee-list.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'blacklist', component: BlacklistComponent },
      { path: 'clients', component: ClientListComponent },
      { path: 'cars', component: CarListComponent },
      { path: 'rentals', component: RentalListComponent },
      { path: 'rentals/:id', component: RentalDetailComponent },
      { path: 'incidents', component: IncidentListComponent },
      { path: 'maintenances', component: MaintenanceListComponent },
      { path: 'repairs', component: RepairListComponent },
      { path: 'employees', component: EmployeeListComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
