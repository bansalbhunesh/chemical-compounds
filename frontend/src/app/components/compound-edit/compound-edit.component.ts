import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompoundService, Compound } from '../../services/compound.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { Location } from '@angular/common';

@Component({
  selector: 'app-compound-edit',
  template: `
    <div class="page-container">
      <!-- Back Navigation -->
      <div class="back-nav">
        <button mat-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
          <span>Back</span>
        </button>
      </div>
      
      <div class="edit-header">
        <h1 class="page-title">{{ isEditMode ? 'Edit Compound' : 'Add New Compound' }}</h1>
      </div>
      
      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container d-flex justify-center align-center">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
      
      <!-- Edit Form -->
      <div *ngIf="!loading" [@fadeAnimation] class="edit-form-container">
        <form [formGroup]="compoundForm" (ngSubmit)="onSubmit()" class="compound-form">
          <div class="form-layout">
            <!-- Left Column - Image Preview -->
            <div class="image-preview-container">
              <div class="image-preview">
                <img 
                  [src]="previewImage || 'assets/images/compound-placeholder.png'" 
                  alt="Compound preview" 
                  class="preview-image"
                  (error)="handleImageError($event)"
                >
              </div>
              
              <mat-form-field appearance="outline" class="image-url-field">
                <mat-label>Image URL</mat-label>
                <input 
                  matInput 
                  formControlName="imageSource" 
                  placeholder="Enter image URL"
                  (blur)="updatePreviewImage()"
                >
                <button 
                  *ngIf="compoundForm.get('imageSource')?.value" 
                  matSuffix 
                  mat-icon-button 
                  type="button"
                  (click)="clearImage()"
                  aria-label="Clear image"
                >
                  <mat-icon>close</mat-icon>
                </button>
                <mat-hint>Provide a direct URL to the compound image</mat-hint>
                <mat-error *ngIf="compoundForm.get('imageSource')?.hasError('pattern')">
                  Please enter a valid URL
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Image Attribution</mat-label>
                <input 
                  matInput 
                  formControlName="imageAttribution" 
                  placeholder="Credit the image source"
                >
                <mat-hint>Optional: Credit the source of the image</mat-hint>
              </mat-form-field>
            </div>
            
            <!-- Right Column - Form Fields -->
            <div class="form-fields-container">
              <mat-form-field appearance="outline">
                <mat-label>Compound Name</mat-label>
                <input 
                  matInput 
                  formControlName="name" 
                  placeholder="Enter compound name"
                >
                <mat-error *ngIf="compoundForm.get('name')?.hasError('required')">
                  Compound name is required
                </mat-error>
                <mat-error *ngIf="compoundForm.get('name')?.hasError('minlength')">
                  Name must be at least 2 characters
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Description</mat-label>
                <textarea 
                  matInput 
                  formControlName="description" 
                  placeholder="Enter compound description"
                  rows="6"
                ></textarea>
                <mat-error *ngIf="compoundForm.get('description')?.hasError('required')">
                  Description is required
                </mat-error>
                <mat-error *ngIf="compoundForm.get('description')?.hasError('minlength')">
                  Description must be at least 10 characters
                </mat-error>
              </mat-form-field>
              
              <div class="form-section">
                <h3 class="section-title">Advanced Options</h3>
                <p class="section-description">These fields will be used in future updates for enhanced compound data.</p>
                
                <div class="advanced-fields">
                  <mat-form-field appearance="outline">
                    <mat-label>Formula</mat-label>
                    <input matInput placeholder="e.g., H2O" disabled>
                    <mat-hint>Coming soon</mat-hint>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Molecular Weight</mat-label>
                    <input matInput placeholder="e.g., 18.01528 g/mol" disabled>
                    <mat-hint>Coming soon</mat-hint>
                  </mat-form-field>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Form Actions -->
          <div class="form-actions">
            <button 
              type="button" 
              mat-stroked-button
              (click)="goBack()"
            >
              Cancel
            </button>
            
            <button 
              type="submit" 
              mat-flat-button 
              color="primary"
              [disabled]="compoundForm.invalid || submitting"
            >
              <mat-icon>save</mat-icon>
              {{ isEditMode ? 'Update Compound' : 'Create Compound' }}
            </button>
          </div>
          
          <mat-progress-bar *ngIf="submitting" mode="indeterminate" class="submit-progress"></mat-progress-bar>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./compound-edit.component.css'],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class CompoundEditComponent implements OnInit {
  compoundForm: FormGroup;
  isEditMode = false;
  loading = true;
  submitting = false;
  previewImage: string | null = null;
  compoundId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private compoundService: CompoundService,
    private snackBar: MatSnackBar,
    private location: Location
  ) {
    // Initialize form with validators
    this.compoundForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      imageSource: ['', [Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]],
      imageAttribution: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEditMode = id !== null && id !== 'new';
    
    if (this.isEditMode && id) {
      this.compoundId = parseInt(id);
      this.loadCompound(this.compoundId);
    } else {
      this.loading = false;
    }
  }

  loadCompound(id: number): void {
    this.compoundService.getCompound(id).pipe(
      catchError(error => {
        this.snackBar.open('Error loading compound. Please try again.', 'Close', {
          duration: 5000
        });
        this.router.navigate(['/compounds']);
        return of(null);
      })
    ).subscribe(compound => {
      if (compound) {
        this.compoundForm.patchValue({
          name: compound.name,
          description: compound.description,
          imageSource: compound.imageSource,
          imageAttribution: compound.imageAttribution
        });
        this.previewImage = compound.imageSource;
      }
      this.loading = false;
    });
  }

  updatePreviewImage(): void {
    const imageUrl = this.compoundForm.get('imageSource')?.value;
    this.previewImage = imageUrl ? imageUrl : null;
  }

  clearImage(): void {
    this.compoundForm.get('imageSource')?.setValue('');
    this.compoundForm.get('imageAttribution')?.setValue('');
    this.previewImage = null;
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/images/compound-placeholder.png';
  }

  onSubmit(): void {
    if (this.compoundForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.compoundForm.controls).forEach(key => {
        const control = this.compoundForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    const formData = this.compoundForm.value;
    
    const compound: Partial<Compound> = {
      name: formData.name,
      description: formData.description,
      imageSource: formData.imageSource,
      imageAttribution: formData.imageAttribution
    };

    if (this.isEditMode && this.compoundId) {
      // Update existing compound
      this.compoundService.updateCompound(this.compoundId, compound).pipe(
        catchError(error => {
          this.snackBar.open('Error updating compound. Please try again.', 'Close', {
            duration: 5000
          });
          return of(null);
        }),
        finalize(() => {
          this.submitting = false;
        })
      ).subscribe(updatedCompound => {
        if (updatedCompound) {
          this.snackBar.open('Compound updated successfully!', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/compounds', this.compoundId]);
        }
      });
    } else {
      // Create new compound
      this.compoundService.createCompound(compound).pipe(
        catchError(error => {
          this.snackBar.open('Error creating compound. Please try again.', 'Close', {
            duration: 5000
          });
          return of(null);
        }),
        finalize(() => {
          this.submitting = false;
        })
      ).subscribe(newCompound => {
        if (newCompound) {
          this.snackBar.open('Compound created successfully!', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/compounds', newCompound.id]);
        }
      });
    }
  }

  goBack(): void {
    this.location.back();
  }
} 