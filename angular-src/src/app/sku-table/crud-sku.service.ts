import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {Formula} from '../model/formula'
import { Tuple } from '../model/ingredient'

export class CreateMessage {
  name: string;
  number: number;
  case_upc: number;
  unit_upc: number;
  size: string;
  count: number;
  product_line: string;
  formula: Formula;
  formula_scale_factor: string;
  manufacturing_lines: string[];
  manufacturing_rate: string;
  setup_cost: number;
  run_cost: number;
  comment: string;
}

export class RemoveMessage {
  number: number;
}

export class EditMessage {
  name: string;
  number: number;
  newnumber: number;
  case_upc: number;
  unit_upc: number;
  size: string;
  count: number;
  product_line: string;
  formula: string;
  formula_scale_factor: string;
  manufacturing_lines: string[];
  manufacturing_rate: string;
  setup_cost: number;
  run_cost: number;
  comment: string;
}

export class Response {
  success: boolean;
  message: string;
}

export class BulkSkuPopulateMessage {
  skus: Array<any>;
}

export class BulkSkuEditMessage {
  manufacturing_lines: Array<String>;
  skus: Array<any>;
  add: boolean;
}

export class BulkSkuPopulateResponse {
  success: boolean;
  data: {
    all: Array<any>,
    some: Array<any>,
    none: Array<any>
  }
}

export class BulkSkuEditResponse {
  success: boolean;
  message: String;
}

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class CrudSkuService {

	constructor(private http: HttpClient) { }

  add(requestedSku: CreateMessage): Observable<Response>{
    console.log("REQUESTED:");
    console.log(requestedSku);
    return this.http.post<Response>('api/skus/create', requestedSku, httpOptions);
  }

  remove(requestedSku: RemoveMessage): Observable<Response>{
    return this.http.post<Response>('api/skus/delete', requestedSku, httpOptions);
  }

  edit(requestedSku: EditMessage): Observable<Response>{
    console.log(requestedSku);
    return this.http.post<Response>('api/skus/update', requestedSku, httpOptions);
  }

  bulkSkuEdit(body: BulkSkuEditMessage): Observable<BulkSkuEditResponse> {
    return this.http.post<BulkSkuEditResponse>('api/skus/bulk_edit', body, httpOptions);
  }
  
  bulkSkuPopulate(body: BulkSkuPopulateMessage): Observable<BulkSkuPopulateResponse> {
    return this.http.post<BulkSkuPopulateResponse>('api/skus/populate_lines', body, httpOptions);
  }
}
