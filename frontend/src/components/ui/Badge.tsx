import clsx from 'clsx';
import type { ContractStatus, Severity, RepairStatus, IncidentType } from '../../types';

const contractColors: Record<ContractStatus, string> = {
  ACTIVE: 'bg-gray-900 text-white',
  COMPLETED: 'bg-gray-200 text-gray-700',
  CANCELLED: 'bg-gray-100 text-gray-400',
  OVERDUE: 'bg-gray-800 text-white',
};

const contractLabels: Record<ContractStatus, string> = {
  ACTIVE: 'Activo',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
  OVERDUE: 'Vencido',
};

const severityColors: Record<Severity, string> = {
  LOW: 'bg-gray-100 text-gray-500',
  MEDIUM: 'bg-gray-200 text-gray-700',
  HIGH: 'bg-gray-700 text-white',
  CRITICAL: 'bg-gray-900 text-white',
};

const severityLabels: Record<Severity, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

const repairColors: Record<RepairStatus, string> = {
  PENDING: 'bg-gray-200 text-gray-700',
  IN_PROGRESS: 'bg-gray-900 text-white',
  COMPLETED: 'bg-gray-100 text-gray-500',
  CANCELLED: 'bg-gray-100 text-gray-400',
};

const repairLabels: Record<RepairStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En proceso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

const incidentLabels: Record<IncidentType, string> = {
  PAYMENT: 'Pago',
  DAMAGE: 'Daños',
  NOT_RETURNED: 'No devuelto',
  LATE_RETURN: 'Devolución tardía',
  THEFT: 'Robo',
  ACCIDENT: 'Accidente',
  OTHER: 'Otro',
};

interface Props {
  children?: React.ReactNode;
  className?: string;
}

function Base({ children, className }: Props) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', className)}>
      {children}
    </span>
  );
}

export function ContractBadge({ status }: { status: ContractStatus }) {
  return <Base className={contractColors[status]}>{contractLabels[status]}</Base>;
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <Base className={severityColors[severity]}>{severityLabels[severity]}</Base>;
}

export function RepairBadge({ status }: { status: RepairStatus }) {
  return <Base className={repairColors[status]}>{repairLabels[status]}</Base>;
}

export function IncidentTypeBadge({ type }: { type: IncidentType }) {
  return <Base className="bg-gray-100 text-gray-600">{incidentLabels[type]}</Base>;
}

export function BlacklistedBadge() {
  return <Base className="bg-gray-900 text-white font-semibold">⚠ Lista negra</Base>;
}
