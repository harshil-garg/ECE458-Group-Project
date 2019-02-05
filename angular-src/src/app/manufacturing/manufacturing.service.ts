import { Injectable } from '@angular/core';
import { SkuNameQuantity } from '../model/manufacturing-goal';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class CreateMessage {
  name : string;
  user: string;
  skus : SkuNameQuantity[];
}

export class CreateResponse {
  success: boolean;
  message: string;
}

export class RefreshMessage {
  pageNum: number;
  sortBy: string;
  user: string;
}

export class ResponseData {
  name: string;
	skus: SkuNameQuantity[];
}

export class RefreshResponse {
  success: boolean;
  data: ResponseData[];
  pages: number;
}

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class ManufacturingService {

  constructor(private http: HttpClient) { }

  create(requestedManufacturingGoal: CreateMessage): Observable<CreateResponse>{
    return this.http.post<CreateResponse>('/api/manufacturing_goals/create', requestedManufacturingGoal, httpOptions);
  }

  refresh(requestedRefresh: RefreshMessage): Observable<RefreshResponse>{
    return this.http.post<RefreshResponse>('/api/manufacturing_goals/all', requestedRefresh, httpOptions);
  }
}