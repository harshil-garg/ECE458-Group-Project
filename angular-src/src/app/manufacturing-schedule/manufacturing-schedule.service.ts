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

export class SetEnabledMessage {
	manufacturing_goal: ManufacturingGoal;
	enabled: boolean;
}

export class SetEnabledResponse {
	success: boolean;
}

export class GetEnabledResponse {
	success: boolean;
	data: ManufacturingGoal[];
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

	setEnabled(setEnabledMessage: SetEnabledMessage): Observable<SetEnabledResponse>{
		console.log(setEnabledMessage);
		return this.http.post<SetEnabledResponse>('api/manufacturing_schedule/set_enabled', setEnabledMessage, httpOptions);
	}

	getEnabled(): Observable<GetEnabledResponse>{
		console.log("GET ENABLED");
		return this.http.post<GetEnabledResponse>('api/manufacturing_schedule/get_enabled', httpOptions);
	}

}
