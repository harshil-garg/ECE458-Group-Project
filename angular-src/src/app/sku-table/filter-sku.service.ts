import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Ingredient } from '../model/ingredient'
import { Formula } from '../model/formula'

export class FilterMessage {
	sortBy : string;
	pageNum: string;
	keywords: Array<string>;
	ingredients: Array<[Ingredient, number]>;
	product_lines: Array<string>;
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
	formula: Formula;
	formula_scale_factor: string;
	manufacturing_lines: string[];
	manufacturing_rate: string;
	comment: string;
  __v: number;
}

export class AutocompleteMessage {
	input: string;
}

export class FilterResponse {
  success: boolean;
  data: Array<ResponseData>;
	pages: number;
}

export class AutocompleteResponse {
	data : string[];
}

export class ExportSkusMessage {
	sortBy : string;
	keywords: Array<string>;
	ingredients: Array<string>;
	product_lines: Array<string>;
}

export class SkuCsvData {
	"SKU#"​: number;
  "Name": string;
	"Case UPC": string;
  "Unit UPC": string;
	"Unit size": string;
	"Count per case": string;
	"Product Line Name": string;
	"Comment": string;
}

export class ExportSkusResponse {
  success: boolean;
  data: Array<SkuCsvData>;
}

export class ExportFormulasMessage {
	sortBy : string;
	keywords: Array<string>;
	ingredients: Array<string>;
	product_lines: Array<string>;
}

export class FormulasCsvData {
	"SKU#": number;
	"Ingr#": number;
	"Quantity": number;
}

export class ExportFormulasResponse {
  success: boolean;
  data: Array<FormulasCsvData>;
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
		console.log(filterMessage);
    return this.http.post<FilterResponse>('api/skus/filter', filterMessage, httpOptions);
  }

	exportSkus(exportSkusMessage: ExportSkusMessage): Observable<ExportSkusResponse>{
		return this.http.post<ExportSkusResponse>('api/export/skus', exportSkusMessage, httpOptions);
	}

	exportFormulas(exportFormulasMessage: ExportFormulasMessage): Observable<ExportFormulasResponse>{
		return this.http.post<ExportFormulasResponse>('api/export/formulas', exportFormulasMessage, httpOptions);
	}

	autocompleteIngredients(autocompleteMessage: AutocompleteMessage): Observable<AutocompleteResponse>{
		console.log(autocompleteMessage);
    return this.http.post<AutocompleteResponse>('api/skus/autocomplete_ingredients', autocompleteMessage, httpOptions);
  }

	autocompleteProductLines(autocompleteMessage: AutocompleteMessage): Observable<AutocompleteResponse>{
		console.log(autocompleteMessage);
		return this.http.post<AutocompleteResponse>('api/skus/autocomplete_product_lines', autocompleteMessage, httpOptions);
	}
}
