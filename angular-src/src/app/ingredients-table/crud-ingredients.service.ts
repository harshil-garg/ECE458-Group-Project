import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class CreateMessage {
  name : string;
  number : string;
  vendor_info : string;
  package_size: string;
  cost : string;
  comment : string;
}

export class CreateResponse {
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
export class CrudIngredientsService {

	constructor(private http: HttpClient) { }

  add(requestedIngredient: CreateMessage): Observable<CreateResponse>{
    return this.http.post<CreateResponse>('api/ingredients/add', requestedIngredient, httpOptions);
  }
}
