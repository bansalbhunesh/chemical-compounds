import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.isLoggedIn()) {
      // Check if the route requires admin role
      if (route.data['roles'] && route.data['roles'].includes('admin') && !this.authService.isAdmin()) {
        // User is logged in but not an admin, redirect to home page
        this.router.navigate(['/']);
        return false;
      }
      
      // User is logged in and has the required role (or no specific role is required)
      return true;
    }

    // Not logged in, redirect to login page with return url
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
    return false;
  }
}
