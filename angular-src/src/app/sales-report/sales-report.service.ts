import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse, HttpHeaders } from '@angular/common/http';

export class MainRequest {
  product_lines: Array<string>;
}

export class SummaryRequest {
    sku_number: number;
    customers: Array<string>;
}

export class DrilldownRequest {
  sku_number: number;
  customers: Array<string>;
  start: string;
  end: string;
}

export class AutocompleteMessage {
	input: string;
}

export class AutocompleteResponse {
	// data : {name:string}[];
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

  getMain(request: MainRequest) {
    return this.http.post('api/sales_record/main', request, httpOptions);
  }

  getSummary(request: SummaryRequest) {
    return this.http.post<Response>('api/sales_record/summary_performance', request, httpOptions);
  }

  getDrilldown(request: DrilldownRequest) {
    return this.http.post('api/sales_record/drilldown', request, httpOptions);
  }

  doFlush() {
    return this.http.post('api/sales_record/flush', httpOptions);
  }

  autocompleteCustomers(autocompleteMessage: AutocompleteMessage){
    return this.http.post<AutocompleteResponse>('api/customers/autocomplete', autocompleteMessage, httpOptions);
  }

  allCustomers(){
    return this.http.post<AutocompleteResponse>('api/customers/all', {}, httpOptions);
  }
}
