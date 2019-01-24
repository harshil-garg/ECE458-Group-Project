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

export class RemoveMessage {
  name: string;
}

export class EditMessage {
  name : string;
  number : string;
  vendor_info : string;
  package_size: string;
  cost : string;
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
export class CrudIngredientsService {

	constructor(private http: HttpClient) { }

  add(requestedIngredient: CreateMessage): Observable<Response>{
    return this.http.post<Response>('api/ingredients/add', requestedIngredient, httpOptions);
  }

  remove(requestedIngredient: RemoveMessage): Observable<Response>{
    return this.http.post<Response>('api/ingredients/remove', requestedIngredient, httpOptions);
  }

  edit(requestedIngredient: EditMessage): Observable<Response>{
    return this.http.post<Response>('api/ingredients/edit', requestedIngredient, httpOptions);
  }
}
