import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { CarReturn, CarCondition, FuelLevel } from '../models';

@Injectable({ providedIn: 'root' })
export class CarReturnsService {
  private http = inject(HttpClient);
  private url = '/api/car-returns';

  getAll() { return this.http.get<CarReturn[]>(this.url); }
  create(data: {
    contractId: number;
    returnDate?: string;
    condition: CarCondition;
    fuelLevel?: FuelLevel;
    onTime?: boolean;
    damagesFound: boolean;
    damageDescription?: string;
    notes?: string;
  }) { return this.http.post<CarReturn>(this.url, data); }
}
