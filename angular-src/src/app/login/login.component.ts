import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginState } from '../model/loginstate';
import { AuthenticationService, LoginResponse } from '../authentication.service'
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
	loginError = false;
  showSpinner = false;

	constructor(private authenticationService: AuthenticationService, private router: Router, private snackBar: MatSnackBar) { }

	ngOnInit() { }

	login(email: string, password: string) {
		this.authenticationService.login({email: email, password: password}).subscribe(
			response => this.handleResponse(response, email),
			err => {
				if (err.status === 401) {
          this.snackBar.open("Email or password incorrect", "Close");
					this.loginError = true;
          this.showSpinner = false;
				}
			}
		);
	}

	private handleResponse(response: LoginResponse, email: string) {
	    if (response.success) {
	        this.authenticationService.loginState.loggedIn = true;
	        this.authenticationService.loginState.isAdmin = response.admin;
          this.authenticationService.loginState.user = email;

			this.loginError = false;
      this.showSpinner = false;
			this.router.navigate(['dashboard']);
	    }
  	}
}
