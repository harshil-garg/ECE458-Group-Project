import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Tuple } from '../model/ingredient';

export class CreateMessage {
  name : string;
  number : string;
  ingredient_tuples : [Tuple];
  comment : string;
}

export class RemoveMessage {
  name: string;
}

export class EditMessage {
  name : string;
  number : string;
  newnumber: string;
  ingredient_tuples : [Tuple];
  comment : string;
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
export class CrudFormulaService {

	constructor(private http: HttpClient) { }

  add(requestedFormula: CreateMessage): Observable<Response>{
    console.log(requestedFormula);
    return this.http.post<Response>('api/formulas/create', requestedFormula, httpOptions);
  }

  remove(requestedFormula: RemoveMessage): Observable<Response>{
    return this.http.post<Response>('api/formulas/delete', requestedFormula, httpOptions);
  }

  edit(requestedFormula: EditMessage): Observable<Response>{
    console.log(requestedFormula);
    return this.http.post<Response>('api/formulas/update', requestedFormula, httpOptions);
  }
}
