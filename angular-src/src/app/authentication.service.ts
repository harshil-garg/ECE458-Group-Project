import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class LoginCredentials {
  email: string;
  password: string;
}

export class LoginResponse {
  success: boolean; 
  message: string;
  admin: boolean;
}

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  loginState = {loggedIn: false, isAdmin: false};

	constructor(private http: HttpClient) { }
  
  login(credentials: LoginCredentials):Observable<LoginResponse> {
    return this.http.post<LoginResponse>('api/users/login', credentials, httpOptions);
  }
}
