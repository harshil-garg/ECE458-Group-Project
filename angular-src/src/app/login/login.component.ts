import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LoginState } from '../loginstate';
import { AuthenticationService, LoginResponse } from '../authentication.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  @Input() loginState: LoginState;
	 constructor(private authenticationService: AuthenticationService) { }

	login(email: string, password: string) {
    this.authenticationService.login({email: email, password: password}).subscribe(response => this.handleResponse(response));
    
	} 
  
  private handleResponse(response: LoginResponse) {
    if (response.success) {
        this.loginState.loggedIn = true;
    }
  }
}
