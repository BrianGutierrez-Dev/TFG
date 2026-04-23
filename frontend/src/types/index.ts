export type Role = 'ADMIN' | 'EMPLOYEE';
export type ContractStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
export type CarCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'DAMAGED';
export type FuelLevel = 'FULL' | 'THREE_QUARTERS' | 'HALF' | 'ONE_QUARTER' | 'EMPTY';
export type IncidentType = 'PAYMENT' | 'DAMAGE' | 'NOT_RETURNED' | 'LATE_RETURN' | 'THEFT' | 'ACCIDENT' | 'OTHER';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RepairStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Employee {
  id: number;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt?: string;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  dni: string;
  address?: string;
  isBlacklisted: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { incidents: number; contracts: number; cars: number };
}

export interface Car {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  clientId?: number;
  client?: Pick<Client, 'id' | 'name' | 'dni'>;
  createdAt: string;
  updatedAt: string;
}

export interface RentalContract {
  id: number;
  clientId: number;
  client: Pick<Client, 'id' | 'name' | 'dni' | 'isBlacklisted'>;
  carId: number;
  car: Pick<Car, 'id' | 'licensePlate' | 'brand' | 'model' | 'year'>;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  totalPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  carReturn?: CarReturn;
  incidents?: Incident[];
}

export interface CarReturn {
  id: number;
  contractId: number;
  contract?: RentalContract;
  employeeId: number;
  employee: Pick<Employee, 'id' | 'name'>;
  returnDate: string;
  onTime: boolean;
  condition: CarCondition;
  fuelLevel?: FuelLevel;
  damagesFound: boolean;
  damageDescription?: string;
  notes?: string;
  createdAt: string;
}

export interface Incident {
  id: number;
  clientId: number;
  client: Pick<Client, 'id' | 'name' | 'dni'>;
  contractId?: number;
  contract?: { id: number; car: Pick<Car, 'id' | 'licensePlate' | 'brand' | 'model'> };
  type: IncidentType;
  description: string;
  severity: Severity;
  resolved: boolean;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Maintenance {
  id: number;
  carId: number;
  car: Pick<Car, 'id' | 'licensePlate' | 'brand' | 'model'>;
  type: string;
  description?: string;
  cost?: number;
  date: string;
  nextDueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Repair {
  id: number;
  carId: number;
  car: Pick<Car, 'id' | 'licensePlate' | 'brand' | 'model'>;
  description: string;
  cost?: number;
  status: RepairStatus;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
}
