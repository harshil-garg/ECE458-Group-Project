import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RegisterRequest } from './model/register-request';
import { RegisterResponse } from './model/register-response';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
  })
};

class AutocompleteResponse {
  success: boolean;
  data: Array<any>;
}

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  constructor(private http: HttpClient) { }

  register(name: string, email: string, password: string, password2: string, admin: boolean): Observable<RegisterResponse> {

    let body: RegisterRequest = {name: name, email: email, password: password, password2: password2, admin: admin};

    return this.http.post<RegisterResponse>('api/users/register', body, httpOptions);
  }

  autocompleteUsers(query: string): Observable<AutocompleteResponse> {
    let body = {
      query: query
    }
    return this.http.post<AutocompleteResponse>('api/users/autocomplete', body, httpOptions);
  }

  getPriveleges(email: string): Observable<any> {
    let body = {
      email: email
    };
    console.log(body);
    return this.http.post<any>('api/users/get-priveleges', body, httpOptions);
  }

  updatePriveleges(email: string, admin: boolean, product_manager: boolean, business_manager: boolean, manufacturing_lines: any[], analyst: boolean): Observable<RegisterResponse> {
    let body = {
      email: email,
      admin: admin,
      product_manager: product_manager,
      business_manager: business_manager,
      manufacturing_lines: manufacturing_lines,
      analyst: analyst
    };
    return this.http.post<RegisterResponse>('api/users/update-priveleges', body, httpOptions);
  }

  deleteUser(email: string): Observable<RegisterResponse> {
    let body = {
      email: email
    };
    return this.http.post<RegisterResponse>('api/users/delete-user', body, httpOptions);
  }
}
