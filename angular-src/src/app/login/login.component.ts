import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LoginState } from '../loginstate';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  @Input() loginState: LoginState;
	 constructor() { }

	login(email: string, password: string) {
    if (!this.loginState.loggedIn) {
        console.log(email);
    }
    else {
      console.log("logged in");
    }
    this.loginState.loggedIn = true;
	} 

}
