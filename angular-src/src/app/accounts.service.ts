import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RegisterRequest } from './model/register-request';
import { RegisterResponse } from './model/register-response';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  constructor(private http: HttpClient) { }

  register(name: string, email: string, password: string, password2: string): Observable<RegisterResponse> {

    let body: RegisterRequest = {name: name, email: email, password: password, password2: password2, admin: false};

    return this.http.post<RegisterResponse>('api/users/register', body, httpOptions);
  }
}

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
  })  
};