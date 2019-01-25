import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

	constructor() { }

	ngOnInit() { }

	register(name: string, email: string, password: string, password2: string) {
		
	}

}
