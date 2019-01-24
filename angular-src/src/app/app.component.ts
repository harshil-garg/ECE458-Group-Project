import { Component } from '@angular/core';
import { LoginState } from './loginstate';
import { AuthenticationService } from './authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
	constructor (private authService: AuthenticationService, private router: Router) { }
	title = 'Hypo Meals';
}
