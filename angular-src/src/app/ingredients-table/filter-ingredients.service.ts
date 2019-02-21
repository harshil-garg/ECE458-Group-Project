import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Tuple } from '../model/ingredient';

export class FilterMessage {
	sortBy : string;
	pageNum: string;
	keywords: Array<string>;
	skus : Array<string>;
}

export class AutocompleteMessage {
	input : string;
}

export class ResponseData {
  _id: string;
  name: string;
  number: string;
  vendor_info: string;
  package_size: string;
	unit: string;
  cost: string;
  comment: string;
  __v: number;
	skus: [Tuple];
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

export class ExportMessage {
	sortBy : string;
	keywords: Array<string>;
	skus : Array<string>;
}

export class IngredientCsvData {
	"Ingr#": number;
	"Name": string;
	"Vendor Info": string;
	"Size": string;
	"Cost": number;
	"Comment": string;
}

export class ExportResponse {
  success: boolean;
  data: Array<IngredientCsvData>;
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

	autocomplete(autocompleteMessage: AutocompleteMessage): Observable<AutocompleteResponse>{
		return this.http.post<AutocompleteResponse>('api/ingredients/autocomplete', autocompleteMessage, httpOptions);
	}

	export(exportMessage: ExportMessage): Observable<ExportResponse>{
		return this.http.post<ExportResponse>('api/export/ingredients', exportMessage, httpOptions);
	}
}
