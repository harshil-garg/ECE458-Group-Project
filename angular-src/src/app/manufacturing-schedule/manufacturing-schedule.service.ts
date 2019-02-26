import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Tuple } from '../model/ingredient';
import { ManufacturingGoal } from '../model/manufacturing-goal';

export class AutocompleteMessage {
	goal: string;
  user: string;
}

export class AutocompleteResponse {
	data : ManufacturingGoal[];
}

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class ManufacturingScheduleService {

	constructor(private http: HttpClient) { }

	autocomplete(autocompleteMessage: AutocompleteMessage): Observable<AutocompleteResponse>{
		return this.http.post<AutocompleteResponse>('api/manufacturing_schedule/autocomplete', autocompleteMessage, httpOptions);
	}

}
