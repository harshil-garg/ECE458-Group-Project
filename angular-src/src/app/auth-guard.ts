import { Injectable }       from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild,
  NavigationExtras,
  CanLoad, Route
}                           from '@angular/router';
import { AuthenticationService }      from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(private authService: AuthenticationService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
      if (!this.authService.loginState.loggedIn) {
          this.router.navigate(['/login']);
      }
    return  this.authService.loginState.loggedIn;
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.loginState.loggedIn) {
        this.router.navigate(['/login']);
    }
    return this.authService.loginState.loggedIn;
  }

  canLoad(route: Route): boolean {
    if (!this.authService.loginState.loggedIn) {
        this.router.navigate(['/login']);
    }
    return this.authService.loginState.loggedIn;
  }
}


/*
Copyright 2017-2018 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/