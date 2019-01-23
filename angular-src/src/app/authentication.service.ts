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

  loginState = {loggedIn: false};

	constructor(private http: HttpClient) { }
  
  login(credentials: LoginCredentials):Observable<LoginResponse> {
    return this.http.post<LoginResponse>('api/users/login', credentials, httpOptions);
  }

	private request(method: 'post'|'get', type: 'login'|'register'|'profile', body) {
	  let base;

	  if (method === 'post') {
	    base = this.http.post(`/api/${type}`, {});
	  } else {
	    base = this.http.get(`/api/${type}`);
	  }
	}
}
