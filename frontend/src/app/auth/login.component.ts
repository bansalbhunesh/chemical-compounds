import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container" [@fadeAnimation]>
      <div class="login-card">
        <div class="login-header">
          <div class="login-icon">⚗️</div>
          <h1>Welcome Back</h1>
          <p>Sign in to manage chemical compounds</p>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input 
              matInput 
              formControlName="email" 
              type="email" 
              placeholder="Enter your email"
              required
            >
            <mat-icon matPrefix>email</mat-icon>
            <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
              Email is required
            </mat-error>
            <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
              Please enter a valid email
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input 
              matInput 
              formControlName="password" 
              [type]="showPassword ? 'text' : 'password'" 
              placeholder="Enter your password"
              required
            >
            <mat-icon matPrefix>lock</mat-icon>
            <button 
              mat-icon-button 
              matSuffix 
              type="button"
              (click)="togglePasswordVisibility()"
            >
              <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
              Password is required
            </mat-error>
          </mat-form-field>
          
          <div *ngIf="error" class="error-message">
            <mat-icon>error</mat-icon>
            <span>{{ error }}</span>
          </div>
          
          <div class="login-actions">
            <button 
              mat-flat-button 
              color="primary" 
              type="submit" 
              [disabled]="loginForm.invalid || loading"
              class="login-button"
            >
              <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
              <span *ngIf="!loading">Sign In</span>
            </button>
          </div>
          
          <div class="login-hint">
            <p>Use demo credentials:</p>
            <p><strong>Email:</strong> admin@example.com</p>
            <p><strong>Password:</strong> Admin1234</p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - var(--header-height));
      padding: 40px 20px;
      background-color: var(--background-color);
    }
    
    .login-card {
      width: 100%;
      max-width: 400px;
      background-color: var(--card-background);
      border-radius: var(--border-radius);
      box-shadow: var(--card-shadow);
      overflow: hidden;
    }
    
    .login-header {
      padding: 40px 32px 24px;
      text-align: center;
    }
    
    .login-icon {
      font-size: 48px;
      margin-bottom: 24px;
    }
    
    .login-header h1 {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: var(--text-primary);
    }
    
    .login-header p {
      color: var(--text-secondary);
      margin: 0;
    }
    
    .login-form {
      padding: 0 32px 32px;
    }
    
    mat-form-field {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .error-message {
      background-color: rgba(255, 59, 48, 0.1);
      color: var(--danger-color);
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
    }
    
    .error-message mat-icon {
      margin-right: 8px;
      font-size: 20px;
    }
    
    .login-actions {
      margin-top: 24px;
    }
    
    .login-button {
      width: 100%;
      height: 48px;
      border-radius: 24px;
      font-size: 16px;
    }
    
    .login-hint {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
      font-size: 14px;
      color: var(--text-secondary);
    }
    
    .login-hint p {
      margin: 4px 0;
    }
    
    @media (max-width: 480px) {
      .login-header {
        padding: 32px 24px 16px;
      }
      
      .login-form {
        padding: 0 24px 24px;
      }
    }
  `],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;
  returnUrl: string = '/';
  showPassword: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
  
  ngOnInit(): void {
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }
  }
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  onSubmit(): void {
    if (this.loginForm.invalid) return;
    
    this.loading = true;
    this.error = null;
    
    const { email, password } = this.loginForm.value;
    
    this.authService.login(email, password).pipe(
      catchError(err => {
        this.error = err.error?.message || 'Invalid credentials. Please try again.';
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe(response => {
      if (response) {
        this.router.navigate([this.returnUrl]);
      }
    });
  }
} 