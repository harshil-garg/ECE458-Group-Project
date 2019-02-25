import { Component, OnInit } from '@angular/core';
import { AccountsService } from '../accounts.service';
import { AuthenticationService } from '../authentication.service';
import { MatSnackBar } from '@angular/material';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
	adminSelection = false;
	adminFormControl = new FormControl();
	suggestedUsers = [];

	constructor(private authenticationService: AuthenticationService, private accountsService: AccountsService, private snackBar: MatSnackBar) { }

	ngOnInit() {
		this.adminFormControl.valueChanges.debounceTime(200)
		.distinctUntilChanged()
		.switchMap((query) =>  this.accountsService.autocompleteUsers(query))
		.subscribe( result => {
			if(result!=null && result.data!=null){
					 this.suggestedUsers = result.data.slice();
			 }
		 });
	}

	register(name: string, email: string, password: string, password2: string) {
		this.accountsService.register(name, email, password, password2, this.adminSelection).subscribe((response) => {
				this.snackBar.open(response.message, 'close');
		}, (err) => {
			this.snackBar.open(err, 'close');
		});
	}

	makeAdmin(email: string) {
		this.accountsService.makeAdmin(email).subscribe((response) => {
				this.snackBar.open(response.message, 'close');
		}, (err) => {
			this.snackBar.open(err, 'close');
		});
	}

  isAdmin(){
    return this.authenticationService.loginState.isAdmin;
  }

}
