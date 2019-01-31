import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Ingredient } from '../model/ingredient'

export class CreateMessage {
  name: string;
  number: number;
  case_upc: number;
  unit_upc: number;
  size: string;
  count: number;
  product_line: string;
  ingredients: Array<[Ingredient, number]>;
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
  ingredients: Array<[Ingredient, number]>;
  comment: string;
}

export class Response {
  success: boolean;
  message: string;
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
    return this.http.post<Response>('api/skus/create', requestedSku, httpOptions);
  }

  remove(requestedSku: RemoveMessage): Observable<Response>{
    return this.http.post<Response>('api/skus/delete', requestedSku, httpOptions);
  }

  edit(requestedSku: EditMessage): Observable<Response>{
    console.log(requestedSku);
    return this.http.post<Response>('api/skus/update', requestedSku, httpOptions);
  }
}
