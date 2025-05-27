import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompoundService, Compound } from '../../services/compound.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { Location } from '@angular/common';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-compound-detail',
  template: `
    <div class="page-container">
      <!-- Back Navigation -->
      <div class="back-nav">
        <button mat-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
          <span>Back</span>
        </button>
      </div>
      
      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container d-flex justify-center align-center">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
      
      <!-- Error State -->
      <div *ngIf="error" class="error-container">
        <mat-icon color="warn">error</mat-icon>
        <h2>{{ error }}</h2>
        <button mat-raised-button color="primary" (click)="goBack()">
          Go Back
        </button>
      </div>
      
      <!-- Compound Detail -->
      <div *ngIf="compound && !loading" [@fadeAnimation] class="detail-container">
        <div class="detail-header">
          <h1 class="compound-title">{{ compound?.name }}</h1>
          
          <!-- Admin Actions -->
          <div class="admin-actions" *ngIf="isAdmin">
            <button mat-raised-button color="primary" (click)="editCompound()">
              <mat-icon>edit</mat-icon>
              Edit
            </button>
            <button mat-raised-button color="warn" (click)="deleteCompound()">
              <mat-icon>delete</mat-icon>
              Delete
            </button>
          </div>
        </div>
        
        <div class="detail-content">
          <!-- Left Column - Image -->
          <div class="image-container">
            <img 
              [src]="compound?.imageSource || 'assets/images/compound-placeholder.png'" 
              [alt]="compound?.name || 'Compound image'"
              class="compound-image"
              (error)="handleImageError($event)"
            >
            <div class="image-attribution" *ngIf="compound?.imageAttribution">
              <mat-icon>photo_camera</mat-icon>
              <span>{{ compound?.imageAttribution }}</span>
            </div>
          </div>
          
          <!-- Right Column - Information -->
          <div class="info-container">
            <!-- Tabs for different types of information -->
            <mat-tab-group animationDuration="300ms" mat-stretch-tabs="false" mat-align-tabs="start">
              <!-- Overview Tab -->
              <mat-tab label="Overview">
                <div class="tab-content">
                  <div class="info-section">
                    <h2 class="section-title">Description</h2>
                    <p class="description">{{ compound?.description }}</p>
                  </div>
                  
                  <div class="info-section">
                    <h2 class="section-title">Properties</h2>
                    <div class="properties-grid">
                      <div class="property-item">
                        <span class="property-label">ID</span>
                        <span class="property-value">{{ compound?.id }}</span>
                      </div>
                      <div class="property-item">
                        <span class="property-label">Name</span>
                        <span class="property-value">{{ compound?.name }}</span>
                      </div>
                      <div class="property-item">
                        <span class="property-label">Last Updated</span>
                        <span class="property-value">{{ formatDate(compound?.dateModified) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-tab>
              
              <!-- Structure Tab (placeholder for future enhancement) -->
              <mat-tab label="Structure">
                <div class="tab-content empty-content">
                  <mat-icon>science</mat-icon>
                  <h3>Molecular Structure</h3>
                  <p>Detailed structural information will be available in a future update.</p>
                </div>
              </mat-tab>
              
              <!-- References Tab (placeholder for future enhancement) -->
              <mat-tab label="References">
                <div class="tab-content empty-content">
                  <mat-icon>menu_book</mat-icon>
                  <h3>Scientific References</h3>
                  <p>Academic and research references will be available in a future update.</p>
                </div>
              </mat-tab>
            </mat-tab-group>
          </div>
        </div>
        
        <!-- Related Compounds Section (placeholder for future enhancement) -->
        <div class="related-compounds">
          <h2 class="section-title">Related Compounds</h2>
          <p class="placeholder-message">Related compounds feature coming soon!</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./compound-detail.component.css'],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class CompoundDetailComponent implements OnInit {
  compound: Compound | null = null;
  loading = true;
  error: string | null = null;
  isAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private compoundService: CompoundService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private location: Location,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadCompound();
  }

  loadCompound(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid compound ID';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.compoundService.getCompound(parseInt(id)).subscribe({
      next: (compound) => {
        this.compound = compound;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading compound', error);
        this.error = 'Compound not found or could not be loaded.';
        this.loading = false;
      }
    });
  }

  editCompound(): void {
    if (!this.compound) return;
    this.router.navigate(['/compounds', this.compound.id, 'edit']);
  }

  deleteCompound(): void {
    if (!this.compound) return;
    
    if (confirm(`Are you sure you want to delete ${this.compound.name}?`)) {
      this.compoundService.deleteCompound(this.compound.id).subscribe({
        next: () => {
          this.snackBar.open(`${this.compound?.name} has been deleted`, 'Close', { 
            duration: 3000
          });
          this.router.navigate(['/compounds']);
        },
        error: (error) => {
          console.error('Error deleting compound', error);
          this.snackBar.open('Error deleting compound', 'Close', { 
            duration: 3000
          });
        }
      });
    }
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/images/compound-placeholder.png';
  }

  goBack(): void {
    this.location.back();
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Unknown';
    return this.datePipe.transform(date, 'medium') || 'Unknown';
  }
} 