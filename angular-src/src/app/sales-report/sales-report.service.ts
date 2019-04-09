import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse, HttpHeaders } from '@angular/common/http';

export class SummaryRequest {
    product_lines: Array<string>;
    customers: Array<string>;
}

export class DrilldownRequest {
  sku_number: number;
  customers: Array<string>;
  start: string;
  end: string;
}

export class SalesProjectionRequest {
  sku_number: number;
  start: string;
  end: string;
}

/*export class SalesProjectionResponse {
  data : any;
  success: boolean;
  message: string;
}*/

export class AutocompleteMessage {
	input: string;
}

export class AutocompleteResponse {
	data : any[];
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
export class SalesReportService {

  constructor(private http: HttpClient) { }

  getSummary(request: SummaryRequest) {
    return this.http.post<Response>('api/sales_record/summary', request, httpOptions);
  }

  getDrilldown(request: DrilldownRequest) {
    return this.http.post<Response>('api/sales_record/drilldown', request, httpOptions);
  }

  getSalesProjection(request: SalesProjectionRequest) {
    return this.http.post<Response>('api/sales_record/sales_projection_tool', request, httpOptions);
  }

  doFlush() {
    return this.http.post('api/sales_record/flush', httpOptions);
  }

  autocompleteCustomers(autocompleteMessage: AutocompleteMessage) {
    return this.http.post<AutocompleteResponse>('api/customers/autocomplete', autocompleteMessage, httpOptions);
  }

  allCustomers() {
    return this.http.post<AutocompleteResponse>('api/customers/all', {}, httpOptions);
  }
}
