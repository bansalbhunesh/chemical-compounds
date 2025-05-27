import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompoundService, Compound } from '../../services/compound.service';
import { AuthService } from '../../services/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-compound-details',
  template: `
    <div class="details-container" *ngIf="!loading; else loadingTemplate" [@fadeAnimation]>
      <div class="back-nav">
        <a mat-button [routerLink]="['/compounds']" class="back-button">
          <mat-icon>arrow_back</mat-icon>
          <span>Back to Compounds</span>
        </a>
      </div>

      <div *ngIf="compound" class="compound-details">
        <div class="image-section">
          <div class="image-container" *ngIf="compound.imageSource">
            <img 
              [src]="compound.imageSource" 
              [alt]="compound.name"
              class="compound-image"
              (error)="onImageError($event)"
            >
            <div class="image-attribution" *ngIf="compound.imageAttribution">
              Source: {{ compound.imageAttribution }}
            </div>
          </div>
          <div class="placeholder-image" *ngIf="!compound.imageSource">
            <mat-icon>science</mat-icon>
          </div>
        </div>
        
        <div class="content-section">
          <h1 class="compound-name">{{ compound.name }}</h1>
          
          <div class="metadata">
            <div class="metadata-item">
              <mat-icon>calendar_today</mat-icon>
              <span>Last updated: {{ compound.dateModified | date:'medium' }}</span>
            </div>
            
            <div class="metadata-item" *ngIf="compound.imageAttribution">
              <mat-icon>photo_camera</mat-icon>
              <span>Image credit: {{ compound.imageAttribution }}</span>
            </div>
          </div>
          
          <div class="description-section">
            <h2>Description</h2>
            <p class="description">{{ compound.description || 'No description available.' }}</p>
          </div>
          
          <div class="admin-actions" *ngIf="isAdmin">
            <button 
              mat-flat-button 
              color="primary" 
              [routerLink]="['/compounds', compound.id, 'edit']"
              class="edit-button"
            >
              <mat-icon>edit</mat-icon>
              Edit Compound
            </button>
            
            <button 
              mat-stroked-button 
              color="warn" 
              (click)="deleteCompound()"
              class="delete-button"
            >
              <mat-icon>delete</mat-icon>
              Delete Compound
            </button>
          </div>
        </div>
      </div>
      
      <div *ngIf="!compound && !error" class="not-found">
        <mat-icon>sentiment_dissatisfied</mat-icon>
        <h2>Compound Not Found</h2>
        <p>The compound you're looking for doesn't exist or has been removed.</p>
        <button mat-flat-button color="primary" [routerLink]="['/compounds']">
          View All Compounds
        </button>
      </div>
      
      <div *ngIf="error" class="error-message">
        <mat-icon>error</mat-icon>
        <h2>Error Loading Compound</h2>
        <p>{{ error }}</p>
        <button mat-flat-button color="primary" (click)="loadCompound()">Try Again</button>
      </div>
    </div>
    
    <ng-template #loadingTemplate>
      <div class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading compound details...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .details-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }
    
    .back-nav {
      margin-bottom: 24px;
    }
    
    .back-button {
      color: var(--text-secondary);
      padding: 8px 0;
    }
    
    .back-button mat-icon {
      margin-right: 8px;
    }
    
    .compound-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 48px;
    }
    
    .image-section {
      position: relative;
    }
    
    .image-container {
      position: relative;
      border-radius: var(--border-radius);
      overflow: hidden;
      box-shadow: var(--card-shadow);
      background-color: var(--card-background);
    }
    
    .compound-image {
      width: 100%;
      display: block;
      object-fit: cover;
    }
    
    .image-attribution {
      position: absolute;
      bottom: 16px;
      right: 16px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px 12px;
      font-size: 12px;
      border-radius: 20px;
      backdrop-filter: blur(4px);
    }
    
    .placeholder-image {
      background-color: var(--background-color);
      border-radius: var(--border-radius);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      box-shadow: var(--card-shadow);
    }
    
    .placeholder-image mat-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: var(--secondary-color);
    }
    
    .content-section {
      display: flex;
      flex-direction: column;
    }
    
    .compound-name {
      font-size: 32px;
      font-weight: 600;
      margin: 0 0 24px 0;
      color: var(--text-primary);
    }
    
    .metadata {
      margin-bottom: 32px;
    }
    
    .metadata-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      color: var(--text-secondary);
    }
    
    .metadata-item mat-icon {
      margin-right: 8px;
      color: var(--secondary-color);
    }
    
    .description-section {
      margin-bottom: 32px;
    }
    
    .description-section h2 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--text-primary);
    }
    
    .description {
      font-size: 16px;
      line-height: 1.6;
      color: var(--text-primary);
      white-space: pre-line;
    }
    
    .admin-actions {
      display: flex;
      gap: 16px;
      margin-top: auto;
    }
    
    .edit-button, .delete-button {
      height: 48px;
      border-radius: 24px;
      padding: 0 24px;
    }
    
    .not-found, .error-message, .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 0;
      text-align: center;
    }
    
    .not-found mat-icon, .error-message mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      color: var(--text-secondary);
    }
    
    .error-message mat-icon {
      color: var(--danger-color);
    }
    
    .not-found h2, .error-message h2 {
      font-size: 24px;
      margin-bottom: 8px;
      color: var(--text-primary);
    }
    
    .not-found p, .error-message p {
      margin-bottom: 24px;
      color: var(--text-secondary);
      max-width: 500px;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 0;
      color: var(--text-secondary);
    }
    
    .loading-container p {
      margin-top: 16px;
    }
    
    @media (max-width: 768px) {
      .compound-details {
        grid-template-columns: 1fr;
        gap: 24px;
      }
      
      .image-container, .placeholder-image {
        max-height: 300px;
      }
      
      .compound-name {
        font-size: 24px;
        margin-bottom: 16px;
      }
    }
  `],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class CompoundDetailsComponent implements OnInit {
  compound: Compound | null = null;
  loading: boolean = true;
  error: string | null = null;
  isAdmin: boolean = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private compoundService: CompoundService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadCompound();
  }
  
  loadCompound(): void {
    this.loading = true;
    this.error = null;
    
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    if (!id) {
      this.error = 'Invalid compound ID';
      this.loading = false;
      return;
    }
    
    this.compoundService.getCompound(id).subscribe({
      next: (compound) => {
        this.compound = compound;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading compound:', err);
        this.error = 'Failed to load compound details. Please try again.';
        this.loading = false;
      }
    });
  }
  
  deleteCompound(): void {
    if (!this.compound) return;
    
    if (confirm(`Are you sure you want to delete ${this.compound.name}?`)) {
      this.compoundService.deleteCompound(this.compound.id).subscribe({
        next: () => {
          this.snackBar.open('Compound deleted successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/compounds']);
        },
        error: (err) => {
          console.error('Error deleting compound:', err);
          this.snackBar.open('Error deleting compound', 'Close', { duration: 3000 });
        }
      });
    }
  }
  
  onImageError(event: any): void {
    event.target.src = 'assets/images/compound-placeholder.png';
  }
} 