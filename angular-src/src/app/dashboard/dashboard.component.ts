import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(private authenticationService: AuthenticationService) { }

  ngOnInit() {
  }

  isAnalyst() {
    return this.authenticationService.isAnalyst();
  }

  isProductManager() {
    return this.authenticationService.isProductManager();
  }

  isBusinessManager() {
    return this.authenticationService.isBusinessManager();
  }

  isPlantManager() {
    return this.authenticationService.isPlantManager();
  }

  isAdmin() {
    return this.authenticationService.isAdmin();
  }

}
