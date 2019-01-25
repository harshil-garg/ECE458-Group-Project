import { Component, OnInit } from '@angular/core';
import { AccountsService } from '../accounts.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
	registerError = false;
	successfulRegistration = false;

	constructor(private accountsService: AccountsService) { }

	ngOnInit() { }

	register(name: string, email: string, password: string, password2: string) {
		this.accountsService.register(name, email, password, password2).subscribe((response) => {
			this.successfulRegistration = response.success;
			if (!response.success) {
				this.registerError = true;
			}
		}, (err) => {
			this.registerError = true;
		});
	}

}
