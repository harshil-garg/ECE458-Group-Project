import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class CreateMessage {
  name : string;
}

export class RemoveMessage {
  name: string;
}

export class EditMessage {
  name : string;
  newname: string;
}

export class ReadMessage {
  pageNum : number;
}

export class ResponseData {
  name: string;
}

export class ReadResponse {
  success: boolean;
  data: Array<ResponseData>;
	pages: number;
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
    return this.http.post<Response>('api/product_lines/create', requestedProductLine, httpOptions);
  }

  remove(requestedProductLine: RemoveMessage): Observable<Response>{
    return this.http.post<Response>('api/product_lines/delete', requestedProductLine, httpOptions);
  }

  edit(requestedProductLine: EditMessage): Observable<Response>{
    return this.http.post<Response>('api/product_lines/update', requestedProductLine, httpOptions);
  }

  read(requestedProductLine: ReadMessage): Observable<ReadResponse>{
    return this.http.post<ReadResponse>('api/product_lines/read', requestedProductLine, httpOptions);
  }
}
