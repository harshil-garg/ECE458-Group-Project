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

  loginState = {loggedIn: false, isAdmin: false, user: ''};

  constructor(private http: HttpClient) { }

  login(credentials: LoginCredentials):Observable<LoginResponse> {
    return this.http.post<LoginResponse>('api/users/login', credentials, httpOptions);
  }

  getNetIDInfo(access_token: string) {
    return this.http.get('https://api.colab.duke.edu/identity/v1/', {
      headers: {
        'x-api-key': "determined-jepsen",
        'Authorization': `Bearer ${access_token}`
      }
    });
  }
  
  login_NetID(netid: string, username: string):Observable<LoginResponse> {
    console.log(username);
    console.log(netid);
    return this.http.post<LoginResponse>('api/users/netid', {name: username, email: netid}, httpOptions);
  }
}
