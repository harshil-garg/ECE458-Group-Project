import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class CreateMessage {
  name : string;
  shortname: string;
  comment: string;
}

export class RemoveMessage {
  shortname: string;
}

export class EditMessage {
  name : string;
  shortname: string;
  newshortname: string;
  comment: string;
}

export class ReadMessage {
  pageNum : number;
  page_size: number;
  sortBy : string;
}

export class ResponseData {
  name: string;
  shortname: string;
  comment: string;
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

export class ManufacturingLineCsvData {
	"Name": string;
}

export class ExportResponse {
  success: boolean;
  data: Array<ManufacturingLineCsvData>;
}

export class AutocompleteResponse {
  success: boolean;
  data: Array<any>;
}

export class GenericResponse {
  success: boolean;
  data: Array<any>;
}

export class ReportData {
  start: Date;
  end: Date; 
  manufacturing_line: string;
}

export class ActivityData {
  manufacturing_tasks: Array<string>;
}

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class CrudManufacturingLineService {

  constructor(private http: HttpClient) { }

  add(requestedManufacturingLine: CreateMessage): Observable<Response>{
    return this.http.post<Response>('api/manufacturing_lines/create', requestedManufacturingLine, httpOptions);
  }

  remove(requestedManufacturingLine: RemoveMessage): Observable<Response>{
    return this.http.post<Response>('api/manufacturing_lines/delete', requestedManufacturingLine, httpOptions);
  }

  edit(requestedManufacturingLine: EditMessage): Observable<Response>{
    console.log(requestedManufacturingLine);
    return this.http.post<Response>('api/manufacturing_lines/update', requestedManufacturingLine, httpOptions);
  }

  read(requestedManufacturingLine: ReadMessage): Observable<ReadResponse>{
    console.log(requestedManufacturingLine);
    return this.http.post<ReadResponse>('api/manufacturing_lines/all', requestedManufacturingLine, httpOptions);
  }

  autocompleteLines(query: string): Observable<AutocompleteResponse> {
    return this.http.post<AutocompleteResponse>('api/manufacturing_lines/autocomplete', {input: query}, httpOptions);
  }

  getManufacturingScheduleReport(query: ReportData): Observable<GenericResponse> {
    console.log(query);
    return this.http.post<GenericResponse>('api/manufacturing_schedule/report', query, httpOptions);
  }

  getManufacturingScheduleSummation(query: ActivityData): Observable<GenericResponse> {
    console.log(query);
    return this.http.post<GenericResponse>('api/manufacturing_schedule/report_calculate', query, httpOptions);
  }
}
