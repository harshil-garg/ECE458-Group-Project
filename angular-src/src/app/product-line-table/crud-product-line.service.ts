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
  total_docs: number;
}

export class Response {
  success: boolean;
  message: string;
}

export class ExportMessage {
}

export class ProductLineCsvData {
	"Name": string;
}

export class ExportResponse {
  success: boolean;
  data: Array<ProductLineCsvData>;
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

  export(exportRequest: ExportMessage): Observable<ExportResponse>{
    return this.http.post<ExportResponse>('api/export/product_lines', exportRequest, httpOptions);
  }
}
