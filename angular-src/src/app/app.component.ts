import { Component, OnInit } from '@angular/core';
import { LoginState } from './model/loginstate';
import { AuthenticationService } from './authentication.service';
import { Router } from '@angular/router';
import { Title }     from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
	constructor (private authService: AuthenticationService, private router: Router, private titleService: Title) { }
	title = 'Hypo®Mea3s';

  ngOnInit() {
    this.titleService.setTitle(this.title);
  }
}
