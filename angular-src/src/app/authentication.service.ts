import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

	constructor(private http: HttpClient, private router: Router) { }


	private request(method: 'post'|'get', type: 'login'|'register'|'profile') {
	  let base;

	  if (method === 'post') {
	    base = this.http.post(`/api/${type}`, {});
	  } else {
	    base = this.http.get(`/api/${type}`);
	  }
	}
}
