import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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

	constructor(private authenticationService: AuthenticationService, private router: Router, private route: ActivatedRoute, private snackBar: MatSnackBar) { }

	ngOnInit() { 
		if (this.authenticationService.isAuthenticated()) {
			console.log('hellllll')
			this.router.navigate(['dashboard']);
			return;
		}

	    var url = this.route.snapshot.fragment;
	    if (url && url.length > 10) {
	        console.log(url);
		var params = {};
		var tokens = url.split("&");
		for (var token of tokens) {
		    var key = token.split("=")[0];
		    var value = token.split("=")[1];
		    params[key] = value;
		}
		console.log(params);    
		this.authenticationService.getNetIDInfo(params["access_token"]).subscribe(
		    info => {
		        console.log(info);
		        this.authenticationService.login_NetID(info["netid"], info["displayName"]).subscribe(
			    response => {
			        console.log(response);
				this.handleResponse(response, 'netid_' + info["netid"])
			    },
			    err => {
			        this.snackBar.open("Unable to login with NetID", "Close");
				this.loginError = true;
				this.showSpinner = false;
			    }
			);
		    },
		    err => {
		        this.snackBar.open("Cannot communicate with NetID server", "Close");
			this.loginError = true;
			this.showSpinner = false;
		    }
		);
	    }
	}

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

	login_NetID() {
	    // Redirect URL
	    var redirect = 'https://oauth.oit.duke.edu/oauth/authorize.php?client_id=determined-jepsen&response_type=token&state=1129&scope=basic&redirect_uri=https://' + window.location.host + '/login';
	    console.log(redirect);
	    window.location.href = redirect;
	}


	private handleResponse(response: LoginResponse, email: string) {
		console.log('logged in email: ' + email);
	    if (response.success) {
          this.authenticationService.loginState.user = email;
			this.authenticationService.saveToken(response.token);
			this.loginError = false;
      		this.showSpinner = false;
			this.router.navigate(['dashboard']);
	    }
  	}
}
