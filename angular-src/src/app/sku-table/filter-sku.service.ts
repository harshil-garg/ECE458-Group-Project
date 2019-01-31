import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Ingredient } from '../model/ingredient'

export class FilterMessage {
	sortBy : string;
	pageNum: string;
	keywords: Array<string>;
	skus : Array<string>;
}

export class ResponseData {
  _id: string;
  name: string;
  number: number;
  case_upc: number;
	unit_upc: number;
	size: string;
	count: number;
  product_line: string;
	ingredients: Array<[Ingredient, number]>;
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
export class FilterSkuService {

	constructor(private http: HttpClient) { }

  filter(filterMessage: FilterMessage): Observable<FilterResponse>{
    return this.http.post<FilterResponse>('api/skus/filter', filterMessage, httpOptions);
  }
}
