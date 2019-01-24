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
	 
	constructor(private authenticationService: AuthenticationService, private router: Router) { }

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
	        this.authenticationService.loginState.loggedIn = true;
	        this.authenticationService.loginState.loggedIn = response.admin;
	        if (response.admin) {
	        console.log('youre an admin!');
	        }
			this.loginError = false;
			this.router.navigate(['/dashboard']);
	    }
  	}
}
