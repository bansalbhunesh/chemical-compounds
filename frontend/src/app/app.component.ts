import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { MatSidenav } from '@angular/material/sidenav';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <app-header></app-header>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .main-content {
      flex: 1;
    }
  `]
})
export class AppComponent implements OnInit {
  @ViewChild('snav') sidenav?: MatSidenav;
  title = 'Chemical Compounds Manager';
  isMobile: boolean = false;
  searchQuery: string = '';
  headerScrolled: boolean = false;
  
  isLoggedIn = false;
  isAdmin = false;
  userName = '';
  userRole = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.checkScreenSize();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.headerScrolled = window.scrollY > 10;
  }

  @HostListener('window:resize', [])
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    if (this.sidenav) {
      if (this.isMobile) {
        this.sidenav.close();
      } else {
        this.sidenav.open();
      }
    }
  }

  ngOnInit() {
    // Subscribe to auth state changes
    this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = this.authService.isAdmin();
      
      if (user) {
        this.userName = user.name || 'User';
        this.userRole = user.role || 'user';
      } else {
        this.userName = '';
        this.userRole = '';
      }
    });
  }

  searchCompounds(query: string) {
    if (query && query.trim()) {
      this.router.navigate(['/compounds'], { queryParams: { search: query } });
    }
  }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}