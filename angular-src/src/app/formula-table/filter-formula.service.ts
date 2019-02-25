import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Tuple } from '../model/ingredient';

export class FilterMessage {
	sortBy : string;
	pageNum: string;
	page_size: number;
	keywords: Array<string>;
	ingredients : Array<string>;
}

export class AutocompleteMessage {
	input : string;
}

export class ResponseData {
  name: string;
  number: string;
  ingredient_tuples: [Tuple];
  comment: string;
}

export class FilterResponse {
  success: boolean;
  data: Array<ResponseData>;
	pages: number;
	total_docs: number;
}

export class AutocompleteResponse {
	data : string[];
}

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class FilterFormulaService {

	constructor(private http: HttpClient) { }

  filter(filterMessage: FilterMessage): Observable<FilterResponse>{
		console.log(filterMessage);
    return this.http.post<FilterResponse>('api/formulas/filter', filterMessage, httpOptions);
  }

	autocomplete(autocompleteMessage: AutocompleteMessage): Observable<AutocompleteResponse>{
		return this.http.post<AutocompleteResponse>('api/formulas/autocomplete', autocompleteMessage, httpOptions);
	}
}
