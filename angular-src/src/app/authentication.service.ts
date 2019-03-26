import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export class LoginCredentials {
  email: string;
  password: string;
}

export class LoginResponse {
  success: boolean;
  token: any;
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
  token = '';

  loginState = {user: ''};

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: LoginCredentials):Observable<LoginResponse> {
    let result = this.http.post<LoginResponse>('api/login', credentials, httpOptions);
    result.subscribe((result) => {
      console.log(result);
      this.saveToken(result.token);
    });
    return result;
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

  private saveToken(token: string): void {
    localStorage.setItem('mean-token', token);
    this.token = token;
    this.getUserDetails();
  }

  private getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('mean-token');
    }
    return this.token;
  }

  public getUserDetails(): any {
    const token = this.getToken();
    let payload;
    if (token) {
      payload = token.split('.')[1];
      payload = window.atob(payload);
      return JSON.parse(payload);
    } else {
      return null;
    }
  }
  public isAuthenticated(): boolean {
    // get the token
    const token = this.getUserDetails();
    // return a boolean reflecting 
    // whether or not the token is expired
    if (token) {
      let d = new Date();
      return (d.getTime() < token.exp);
    }
    else return false;
  }

  public isAdmin(): boolean {
    const token = this.getUserDetails();

    if (token) {
      return token.admin;
    }
    return false;
  }

  public logout(): void {
    this.token = '';
    window.localStorage.removeItem('mean-token');
    this.router.navigateByUrl('/login');
  }
}
