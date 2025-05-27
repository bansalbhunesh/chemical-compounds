import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-login',
  template: `
    <div class="page-container login-container">
      <div class="login-card" [@fadeAnimation]>
        <div class="login-header">
          <mat-icon class="login-icon">science</mat-icon>
          <h1 class="login-title">Admin Login</h1>
          <p class="login-subtitle">Sign in to manage chemical compounds</p>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input 
              matInput 
              formControlName="email" 
              placeholder="admin@example.com"
              type="email" 
              autocomplete="email"
            >
            <mat-icon matPrefix>email</mat-icon>
            <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
              Email is required
            </mat-error>
            <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
              Please enter a valid email address
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input 
              matInput 
              formControlName="password" 
              [type]="hidePassword ? 'password' : 'text'"
              autocomplete="current-password"
            >
            <mat-icon matPrefix>lock</mat-icon>
            <button 
              mat-icon-button 
              matSuffix 
              (click)="hidePassword = !hidePassword" 
              [attr.aria-label]="'Hide password'" 
              [attr.aria-pressed]="hidePassword"
              type="button"
            >
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
              Password is required
            </mat-error>
          </mat-form-field>
          
          <div class="login-actions">
            <button 
              mat-flat-button 
              color="primary" 
              type="submit" 
              [disabled]="loginForm.invalid || loading"
              class="login-button"
            >
              <mat-icon>login</mat-icon>
              Sign In
            </button>
            
            <button 
              mat-button 
              type="button" 
              (click)="fillDemoCredentials()"
              class="demo-button"
            >
              Use Demo Credentials
            </button>
          </div>
          
          <mat-progress-bar *ngIf="loading" mode="indeterminate" class="login-progress"></mat-progress-bar>
        </form>
        
        <div class="login-footer">
          <a mat-button routerLink="/compounds" class="back-link">
            <mat-icon>arrow_back</mat-icon>
            Back to Compounds
          </a>
        </div>
      </div>
      
      <div class="login-info">
        <div class="info-card">
          <mat-icon>info</mat-icon>
          <h3>Demo Account</h3>
          <p>Use the following credentials to log in:</p>
          <div class="credentials">
            <span><strong>Email:</strong> admin@example.com</span>
            <span><strong>Password:</strong> password123</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 16px;
      min-height: calc(100vh - 64px - 64px);
    }
    
    .login-card {
      width: 100%;
      max-width: 450px;
      background-color: var(--card-background);
      border-radius: var(--border-radius);
      box-shadow: var(--card-shadow);
      padding: 32px;
      margin-bottom: 24px;
    }
    
    .login-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 24px;
    }
    
    .login-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--primary-color);
      margin-bottom: 16px;
    }
    
    .login-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: var(--text-primary);
    }
    
    .login-subtitle {
      color: var(--text-secondary);
      margin: 0;
    }
    
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .login-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 8px;
    }
    
    .login-button {
      height: 48px;
      font-size: 16px;
    }
    
    .login-button mat-icon {
      margin-right: 8px;
    }
    
    .demo-button {
      font-size: 14px;
    }
    
    .login-progress {
      margin-top: 16px;
    }
    
    .login-footer {
      margin-top: 24px;
      display: flex;
      justify-content: center;
    }
    
    .back-link {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
    }
    
    .login-info {
      width: 100%;
      max-width: 450px;
    }
    
    .info-card {
      background-color: var(--primary-transparent);
      border-radius: var(--border-radius);
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    
    .info-card mat-icon {
      color: var(--primary-color);
      margin-bottom: 8px;
    }
    
    .info-card h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
    }
    
    .info-card p {
      margin: 0 0 16px 0;
      color: var(--text-secondary);
    }
    
    .credentials {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background-color: rgba(255, 255, 255, 0.7);
      border-radius: 8px;
      width: 100%;
    }
    
    @media (max-width: 600px) {
      .login-container {
        padding: 24px 16px;
      }
      
      .login-card {
        padding: 24px;
      }
    }
  `],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/compounds']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
        this.router.navigate(['/compounds']);
      },
      error: (error) => {
        console.error('Login error', error);
        this.snackBar.open('Invalid email or password', 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  fillDemoCredentials(): void {
    this.loginForm.patchValue({
      email: 'admin@example.com',
      password: 'password123'
    });
  }
} 