import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class CreateMessage {
  name : string;
  number : string;
  vendor_info : string;
  package_size: string;
  cost : string;
  comment : string;
}

export class RemoveMessage {
  name: string;
}

export class EditMessage {
  name : string;
  newname: string;
  number : string;
  vendor_info : string;
  package_size: string;
  cost : string;
  comment : string;
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
export class CrudProductLineService {

  constructor(private http: HttpClient) { }

  add(requestedProductLine: CreateMessage): Observable<Response>{
    return this.http.post<Response>('api/product_line/create', requestedProductLine, httpOptions);
  }

  remove(requestedProductLine: RemoveMessage): Observable<Response>{
    return this.http.post<Response>('api/product_line/delete', requestedProductLine, httpOptions);
  }

  edit(requestedProductLine: EditMessage): Observable<Response>{
    return this.http.post<Response>('api/product_line/update', requestedProductLine, httpOptions);
  }
}
