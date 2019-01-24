import { Component } from '@angular/core';
import { LoginState } from './loginstate';
import { AuthenticationService } from './authentication.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
	constructor (private authService: AuthenticationService) { }
	title = 'Hypo Meals';
}
