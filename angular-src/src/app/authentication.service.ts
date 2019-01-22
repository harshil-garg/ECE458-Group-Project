import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

	constructor(private http: HttpClient, private router: Router) { }
  
  login(username: string, password: string) {
    this.request('post', 'login', {});
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
