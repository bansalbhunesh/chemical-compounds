import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="main-footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="footer-logo">
              <mat-icon>science</mat-icon>
              <span>Chemical Compounds</span>
            </div>
            <p class="footer-tagline">
              A comprehensive database of chemical compounds for research and education.
            </p>
          </div>
          
          <div class="footer-links">
            <div class="link-group">
              <h3 class="link-group-title">Navigation</h3>
              <ul class="link-list">
                <li><a routerLink="/compounds">Dashboard</a></li>
                <li><a routerLink="/compounds/gallery">Gallery</a></li>
                <li><a routerLink="/login">Admin Login</a></li>
              </ul>
            </div>
            
            <div class="link-group">
              <h3 class="link-group-title">Resources</h3>
              <ul class="link-list">
                <li><a href="#">Documentation</a></li>
                <li><a href="#">API</a></li>
                <li><a href="#">Data Sources</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p class="copyright">
            &copy; {{ currentYear }} Chemical Compounds Manager. All rights reserved.
          </p>
          <p class="version">Version 1.0.0</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .main-footer {
      background-color: var(--card-background);
      border-top: 1px solid rgba(0, 0, 0, 0.08);
      padding: 40px 0 20px;
      color: var(--text-secondary);
    }
    
    .footer-container {
      max-width: var(--container-max-width);
      margin: 0 auto;
      padding: 0 var(--container-padding);
    }
    
    .footer-content {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    
    .footer-brand {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .footer-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--primary-color);
      font-weight: 600;
      font-size: 18px;
    }
    
    .footer-logo mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    
    .footer-tagline {
      margin: 0;
      max-width: 400px;
      line-height: 1.5;
    }
    
    .footer-links {
      display: flex;
      gap: 40px;
    }
    
    .link-group {
      min-width: 120px;
    }
    
    .link-group-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: var(--text-primary);
    }
    
    .link-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .link-list a {
      text-decoration: none;
      color: var(--text-secondary);
      transition: color 0.2s ease;
    }
    
    .link-list a:hover {
      color: var(--primary-color);
    }
    
    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 20px;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
      font-size: 14px;
    }
    
    .copyright, .version {
      margin: 0;
    }
    
    @media (max-width: 768px) {
      .footer-content {
        grid-template-columns: 1fr;
        gap: 32px;
      }
      
      .footer-bottom {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
      }
    }
    
    @media (max-width: 480px) {
      .footer-links {
        flex-direction: column;
        gap: 24px;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
} 