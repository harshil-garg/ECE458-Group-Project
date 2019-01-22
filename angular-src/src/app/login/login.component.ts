import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginState } from '../loginstate';
import { AuthenticationService, LoginResponse } from '../authentication.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
	loginError = false;

	@Input() loginState: LoginState;
	 
	constructor(private authenticationService: AuthenticationService) { }

	ngOnInit() { }

	login(email: string, password: string) {
		this.authenticationService.login({email: email, password: password}).subscribe(
			response => this.handleResponse(response),
			err => {
				if (err.status === 401) {
					this.loginError = true;
				}
			}
		);
	}
  
	private handleResponse(response: LoginResponse) {
	    if (response.success) {
	        this.loginState.loggedIn = true;
	        this.loginError = false;
	    }
  	}
}
