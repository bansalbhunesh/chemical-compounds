import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  template: `
    <header class="main-header" [class.scrolled]="isScrolled">
      <div class="header-container">
        <div class="logo-container">
          <a routerLink="/" class="logo">
            <mat-icon>science</mat-icon>
            <span class="logo-text">Chemical Compounds</span>
          </a>
        </div>
        
        <!-- Desktop Navigation -->
        <nav class="main-nav" [class.mobile-nav-active]="mobileNavActive">
          <ul class="nav-list">
            <li class="nav-item">
              <a 
                routerLink="/compounds" 
                routerLinkActive="active" 
                [routerLinkActiveOptions]="{exact: true}"
                class="nav-link"
              >
                <mat-icon>dashboard</mat-icon>
                <span>Dashboard</span>
              </a>
            </li>
            <li class="nav-item">
              <a 
                routerLink="/compounds/gallery" 
                routerLinkActive="active" 
                class="nav-link"
              >
                <mat-icon>grid_view</mat-icon>
                <span>Gallery</span>
              </a>
            </li>
            <li *ngIf="isAdmin" class="nav-item">
              <a 
                routerLink="/compounds/new" 
                routerLinkActive="active" 
                class="nav-link"
              >
                <mat-icon>add_circle</mat-icon>
                <span>Add Compound</span>
              </a>
            </li>
          </ul>
        </nav>
        
        <!-- User Actions -->
        <div class="user-actions">
          <button 
            *ngIf="!isLoggedIn" 
            mat-flat-button 
            color="primary" 
            routerLink="/login"
            class="login-button"
          >
            <mat-icon>login</mat-icon>
            <span class="button-text">Admin Login</span>
          </button>
          
          <div *ngIf="isLoggedIn" class="user-menu">
            <button 
              mat-button 
              [matMenuTriggerFor]="menu"
              class="user-button"
            >
              <div class="user-avatar">
                <mat-icon>person</mat-icon>
              </div>
              <span class="user-name">{{ userName }}</span>
              <mat-icon>arrow_drop_down</mat-icon>
            </button>
            
            <mat-menu #menu="matMenu" xPosition="before" class="user-dropdown">
              <button mat-menu-item disabled>
                <mat-icon>admin_panel_settings</mat-icon>
                <span>Admin Panel</span>
              </button>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          </div>
          
          <!-- Mobile Menu Toggle -->
          <button 
            mat-icon-button 
            class="mobile-menu-toggle"
            (click)="toggleMobileNav()"
            aria-label="Toggle menu"
          >
            <mat-icon>{{ mobileNavActive ? 'close' : 'menu' }}</mat-icon>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .main-header {
      position: sticky;
      top: 0;
      background-color: var(--card-background);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      transition: box-shadow 0.3s ease;
      height: var(--header-height);
    }
    
    .main-header.scrolled {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    .header-container {
      max-width: var(--container-max-width);
      margin: 0 auto;
      padding: 0 var(--container-padding);
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    /* Logo Styles */
    .logo-container {
      display: flex;
      align-items: center;
    }
    
    .logo {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: var(--primary-color);
      font-weight: 700;
      font-size: 18px;
      gap: 8px;
    }
    
    .logo mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    
    /* Navigation Styles */
    .main-nav {
      display: flex;
      align-items: center;
      height: 100%;
    }
    
    .nav-list {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
      height: 100%;
    }
    
    .nav-item {
      height: 100%;
      position: relative;
    }
    
    .nav-link {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 16px;
      text-decoration: none;
      color: var(--text-primary);
      font-weight: 500;
      transition: color 0.2s ease;
      gap: 8px;
    }
    
    .nav-link:hover {
      color: var(--primary-color);
    }
    
    .nav-link.active {
      color: var(--primary-color);
    }
    
    .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background-color: var(--primary-color);
    }
    
    /* User Actions */
    .user-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .login-button {
      height: 40px;
      border-radius: 20px;
    }
    
    .login-button mat-icon {
      margin-right: 8px;
    }
    
    .user-menu {
      display: flex;
      align-items: center;
    }
    
    .user-button {
      height: 40px;
      border-radius: 20px;
      padding: 0 8px 0 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: var(--primary-transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
    }
    
    .user-name {
      font-weight: 500;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    /* Mobile Menu Toggle */
    .mobile-menu-toggle {
      display: none;
    }
    
    /* Responsive Styles */
    @media (max-width: 768px) {
      .logo-text {
        display: none;
      }
      
      .button-text {
        display: none;
      }
      
      .mobile-menu-toggle {
        display: block;
      }
      
      .main-nav {
        position: fixed;
        top: var(--header-height);
        left: 0;
        right: 0;
        background-color: var(--card-background);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
        z-index: 1000;
        display: block;
      }
      
      .main-nav.mobile-nav-active {
        max-height: 300px;
      }
      
      .nav-list {
        flex-direction: column;
        align-items: stretch;
        height: auto;
        padding: 16px;
      }
      
      .nav-item {
        height: auto;
      }
      
      .nav-link {
        height: auto;
        padding: 12px 16px;
        border-radius: 8px;
      }
      
      .nav-link.active::after {
        display: none;
      }
      
      .nav-link.active {
        background-color: var(--primary-transparent);
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  userName = '';
  isScrolled = false;
  mobileNavActive = false;

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 10;
  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = this.authService.isAdmin();
      this.userName = user ? user.name || 'Admin' : '';
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/compounds']);
  }

  toggleMobileNav(): void {
    this.mobileNavActive = !this.mobileNavActive;
  }
} 