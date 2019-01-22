import { Component } from '@angular/core';
import { LoginState } from './loginstate';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  loginState = {loggedIn: false};
  title = 'angular-src';
}
// add code to route to / here
