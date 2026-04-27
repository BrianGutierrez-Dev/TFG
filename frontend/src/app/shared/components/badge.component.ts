import { Component, Input } from '@angular/core';
import type { ContractStatus, Severity, RepairStatus, IncidentType } from '../../../app/core/models';

const contractColors: Record<ContractStatus, string> = {
  ACTIVE: 'bg-gray-900 text-white',
  COMPLETED: 'bg-gray-200 text-gray-700',
  CANCELLED: 'bg-gray-100 text-gray-400',
  OVERDUE: 'bg-gray-800 text-white',
};
const contractLabels: Record<ContractStatus, string> = {
  ACTIVE: 'Activo', COMPLETED: 'Completado', CANCELLED: 'Cancelado', OVERDUE: 'Vencido',
};
const severityColors: Record<Severity, string> = {
  LOW: 'bg-gray-100 text-gray-500', MEDIUM: 'bg-gray-200 text-gray-700',
  HIGH: 'bg-gray-700 text-white', CRITICAL: 'bg-gray-900 text-white',
};
const severityLabels: Record<Severity, string> = {
  LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', CRITICAL: 'Crítica',
};
const repairColors: Record<RepairStatus, string> = {
  PENDING: 'bg-gray-200 text-gray-700', IN_PROGRESS: 'bg-gray-900 text-white',
  COMPLETED: 'bg-gray-100 text-gray-500', CANCELLED: 'bg-gray-100 text-gray-400',
};
const repairLabels: Record<RepairStatus, string> = {
  PENDING: 'Pendiente', IN_PROGRESS: 'En proceso', COMPLETED: 'Completada', CANCELLED: 'Cancelada',
};
const incidentLabels: Record<IncidentType, string> = {
  PAYMENT: 'Pago', DAMAGE: 'Daños', NOT_RETURNED: 'No devuelto',
  LATE_RETURN: 'Devolución tardía', THEFT: 'Robo', ACCIDENT: 'Accidente', OTHER: 'Otro',
};

@Component({
  selector: 'app-contract-badge',
  standalone: true,
  template: `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ colorClass }}">{{ label }}</span>`,
})
export class ContractBadgeComponent {
  @Input() set status(v: ContractStatus) {
    this.colorClass = contractColors[v];
    this.label = contractLabels[v];
  }
  colorClass = '';
  label = '';
}

@Component({
  selector: 'app-severity-badge',
  standalone: true,
  template: `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ colorClass }}">{{ label }}</span>`,
})
export class SeverityBadgeComponent {
  @Input() set severity(v: Severity) {
    this.colorClass = severityColors[v];
    this.label = severityLabels[v];
  }
  colorClass = '';
  label = '';
}

@Component({
  selector: 'app-repair-badge',
  standalone: true,
  template: `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ colorClass }}">{{ label }}</span>`,
})
export class RepairBadgeComponent {
  @Input() set status(v: RepairStatus) {
    this.colorClass = repairColors[v];
    this.label = repairLabels[v];
  }
  colorClass = '';
  label = '';
}

@Component({
  selector: 'app-incident-type-badge',
  standalone: true,
  template: `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{{ label }}</span>`,
})
export class IncidentTypeBadgeComponent {
  @Input() set type(v: IncidentType) { this.label = incidentLabels[v]; }
  label = '';
}

@Component({
  selector: 'app-blacklisted-badge',
  standalone: true,
  template: `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-900 text-white">⚠ Lista negra</span>`,
})
export class BlacklistedBadgeComponent {}
