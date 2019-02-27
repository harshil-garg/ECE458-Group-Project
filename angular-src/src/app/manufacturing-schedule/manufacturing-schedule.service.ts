import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Tuple } from '../model/ingredient';
import { ManufacturingGoal } from '../model/manufacturing-goal';
import { Activity } from '../model/activity';
import { ManufacturingLine } from '../model/manufacturing-line';
import { ManufacturingScheduleEvent } from '../model/manufacturing-schedule-event';

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

export class LoadResponse {
	success: boolean;
	data: Array<ManufacturingScheduleEvent>;
}

export class CreateActivity {
	manufacturing_goal: string;
	sku: string;
}

export class CreateMessage {
	activity: CreateActivity;
	manufacturing_line: string;
	start_date: Date;
	duration: number;
	duration_override: boolean;
}

export class CreateResponse {
	success: boolean;
	message: string;
}

export class UpdateMessage {
	activity: Activity;
	manufacturing_line: ManufacturingLine;
	start_date: Date;
	duration: number;
}

export class UpdateResponse {
	success: boolean;
	message: string;
}

export class DeleteMessage {
	activity: Activity;
}

export class DeleteResponse {
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
export class ManufacturingScheduleService {

	constructor(private http: HttpClient) { }

	autocomplete(autocompleteMessage: AutocompleteMessage): Observable<AutocompleteResponse>{
		return this.http.post<AutocompleteResponse>('api/manufacturing_schedule/autocomplete', autocompleteMessage, httpOptions);
	}

	setEnabled(setEnabledMessage: SetEnabledMessage): Observable<SetEnabledResponse>{
		return this.http.post<SetEnabledResponse>('api/manufacturing_goals/set_enabled', setEnabledMessage, httpOptions);
	}

	getEnabled(): Observable<GetEnabledResponse>{
		return this.http.post<GetEnabledResponse>('api/manufacturing_goals/get_enabled', httpOptions);
	}

	load(): Observable<LoadResponse>{
		return this.http.post<LoadResponse>('api/manufacturing_schedule/load', httpOptions);
	}

	create(createMessage: CreateMessage): Observable<CreateResponse>{
		console.log("CREATE MESSAGEEEE");
		console.log(createMessage);
		return this.http.post<CreateResponse>('api/manufacturing_schedule/create', createMessage, httpOptions);
	}

	update(updateMessage: UpdateMessage): Observable<UpdateResponse>{
		return this.http.post<UpdateResponse>('api/manufacturing_schedule/update', updateMessage, httpOptions);
	}

	delete(deleteMessage: DeleteMessage): Observable<DeleteResponse>{
		return this.http.post<DeleteResponse>('api/manufacturing_schedule/delete', deleteMessage, httpOptions);
	}

}
