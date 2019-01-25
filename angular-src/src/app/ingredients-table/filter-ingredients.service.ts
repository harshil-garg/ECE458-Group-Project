import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class FilterMessage {
	sortBy : string;
	pageNum: string;
	keywords: Array<string>;
	skus : Array<string>;
}

export class ResponseData {
  _id: string;
  name: string;
  number: string;
  vendor_info: string;
  package_size: string;
  cost: string;
  comment: string;
  __v: number;
}

export class FilterResponse {
  success: boolean;
  data: Array<ResponseData>;
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
export class FilterIngredientsService {

	constructor(private http: HttpClient) { }

  filter(filterMessage: FilterMessage): Observable<FilterResponse>{
    return this.http.post<FilterResponse>('api/ingredients/filter', filterMessage, httpOptions);
  }
}
