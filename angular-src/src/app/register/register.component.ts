import { Component, OnInit } from '@angular/core';
import { AccountsService } from '../accounts.service';
import { AuthenticationService } from '../authentication.service';
import { CrudManufacturingLineService } from '../manufacturing-line-table/crud-manufacturing-line.service';
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
	newAdminSelection = false;
	adminSelection = false;
	userInput: string;
  adminPriveleges: string[] = ['Analyst', 'Product Manager', 'Business Manager', 'Plant Manager', 'Administrator'];
  disabledOptions: string[] = [];
  selectedOptions: string[] = ['Analyst'];
  selectedManufLines: string[];
  manufacturingLines = [];

	constructor(private authenticationService: AuthenticationService, private crudManufacturingLineService: CrudManufacturingLineService, private accountsService: AccountsService, private snackBar: MatSnackBar) { }

	ngOnInit() {
    this.crudManufacturingLineService.read({
        pageNum: -1,
        page_size: 0,
        sortBy: "name"
      }).subscribe(
      response => {
        for(let manufacturingLine of response.data){
          this.manufacturingLines.push(manufacturingLine.shortname);
        }
      },
      err => {
        if (err.status === 401) {
          console.log("401 Error")
        }
      }
    );
  }

	register(name: string, email: string, password: string, password2: string) {
		this.accountsService.register(name, email, password, password2, this.newAdminSelection).subscribe((response) => {
				this.snackBar.open(response.message, 'close', {duration:3000});
		}, (err) => {
			this.snackBar.open(err, 'close', {duration:3000});
		});
	}

	updatePriveleges() {
    var admin = this.selectedOptions.indexOf('Administrator')>-1;
    var product_manager = this.selectedOptions.indexOf('Product Manager')>-1;
    var business_manager = this.selectedOptions.indexOf('Business Manager')>-1;
    var analyst = this.selectedOptions.indexOf('Analyst')>-1;
		this.accountsService.updatePriveleges(this.userInput, admin, product_manager, business_manager, this.selectedManufLines, analyst).subscribe((response) => {
				this.snackBar.open(response.message, 'close', {duration:3000});
		}, (err) => {
			this.snackBar.open(err, 'close', {duration:3000});
		});
	}

	deleteUser() {
		this.accountsService.deleteUser(this.userInput).subscribe((response) => {
			this.snackBar.open(response.message, 'close', {duration:3000});
	}, (err) => {
		this.snackBar.open(err, 'close', {duration:3000});
	});
	}

  isAdmin(){
    return this.authenticationService.isAdmin();
  }

  updateUser(ev){
    this.userInput = ev;
    this.accountsService.getPriveleges(ev).subscribe((response) => {
      this.selectedOptions = [];
      this.selectedManufLines = [];
      console.log("PRIVELEGES");
      console.log(response);
      if(response.data[0]!=null){
        if(response.data[0].analyst){
          this.selectedOptions.push("Analyst");
        }
        if(response.data[0].product_manager){
          this.selectedOptions.push("Product Manager");
        }
        if(response.data[0].business_manager){
          this.selectedOptions.push("Business Manager");
        }
        if(response.data[0].plant_manager!=null && response.data[0].plant_manager.length>0){
          this.selectedOptions.push("Plant Manager");
          response.data[0].plant_manager.forEach(line => {
            console.log(line);
            this.selectedManufLines.push(line.shortname);
          });
        }
        if(response.data[0].admin){
          this.selectedOptions.push("Administrator");
        }
        this.updateDisabled();
      }
    }, (err) => {
      console.log("BAD");
    });
  }

  handleClick(ev){
    ev.stopPropagation();
  }

  updateDisabled(){
    this.disabledOptions = [];
    if(this.selectedOptions.indexOf("Administrator") > -1){
      this.disabledOptions.push("Analyst");
      this.disabledOptions.push("Product Manager");
      this.disabledOptions.push("Business Manager");
      this.disabledOptions.push("Plant Manager");
      this.selectedOptions = ["Administrator", "Plant Manager", "Business Manager", "Product Manager", "Analyst"];
    }
    else if(this.selectedOptions.indexOf("Plant Manager") > -1){
      this.disabledOptions.push("Analyst");
      if(this.selectedOptions.indexOf("Analyst") == -1){
        this.selectedOptions.push("Analyst");
      }
    }
    else if(this.selectedOptions.indexOf("Business Manager") > -1){
      this.disabledOptions.push("Analyst");
      if(this.selectedOptions.indexOf("Analyst") == -1){
        this.selectedOptions.push("Analyst");
      }
    }
    else if(this.selectedOptions.indexOf("Product Manager") > -1){
      this.disabledOptions.push("Analyst");
      if(this.selectedOptions.indexOf("Analyst") == -1){
        this.selectedOptions.push("Analyst");
      }
    }
  }

}
