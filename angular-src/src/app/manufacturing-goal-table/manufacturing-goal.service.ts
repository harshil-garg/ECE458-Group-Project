import { Injectable } from '@angular/core';
import { SkuNameQuantity } from '../model/manufacturing-goal';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class CreateMessage {
  name : string;
  sku_tuples : SkuNameQuantity[];
  deadline: Date;
}

export class CreateResponse {
  success: boolean;
  message: string;
}

export class RefreshMessage {
  pageNum: number;
  page_size: number;
  sortBy: string;
}

export class ResponseData {
  name: string;
	sku_tuples: SkuNameQuantity[];
  deadline: Date;
  author: string;
  last_edit: Date;
}

export class RefreshResponse {
  success: boolean;
  data: ResponseData[];
  pages: number;
  total_docs: number;
}

export class CalculateMessage {
  name: string;
}

export class CalculateData {
  number: number;
  name: string;
  package_size: string;
  cost: number;
	calculated_quantity: string;
}

export class DeleteMessage {
  name: string;
}

export class DeleteResponse {
  success: boolean;
  message: string;
}

export class SetEnabledMessage {
  manufacturing_goal: any;
  enabled: boolean;
}

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class ManufacturingGoalService {

  constructor(private http: HttpClient) { }

  create(requestedManufacturingGoal: CreateMessage): Observable<CreateResponse>{
    console.log(requestedManufacturingGoal);
    return this.http.post<CreateResponse>('/api/manufacturing_goals/create', requestedManufacturingGoal, httpOptions);
  }

  refresh(requestedRefresh: RefreshMessage): Observable<RefreshResponse>{
    return this.http.post<RefreshResponse>('/api/manufacturing_goals/all', requestedRefresh, httpOptions);
  }

  calculate(requestedCalculate: CalculateMessage): Observable<CalculateData[]>{
    return this.http.post<CalculateData[]>('/api/manufacturing_goals/calculator', requestedCalculate, httpOptions);
  }

  delete(requestedDelete: DeleteMessage): Observable<DeleteResponse>{
    return this.http.post<DeleteResponse>('/api/manufacturing_goals/delete', requestedDelete, httpOptions);
  }

  setEnabled(requestedEnabled: SetEnabledMessage): Observable<DeleteResponse>{
    return this.http.post<DeleteResponse>('/api/manufacturing_goals/set_enabled', requestedEnabled, httpOptions);
  }
}
