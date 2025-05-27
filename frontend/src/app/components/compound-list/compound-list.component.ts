import { Component, OnInit, HostListener } from '@angular/core';
import { CompoundService, Compound } from '../../services/compound.service';
import { PageEvent } from '@angular/material/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-compound-list',
  template: `
    <div class="page-container compound-list-container">
      <!-- Header Section with Dynamic Actions -->
      <div class="header-section">
        <div class="title-section">
          <h1 class="page-title">Chemical Compounds</h1>
          <p class="page-subtitle">
            {{ totalItems }} compounds in our database
            <span *ngIf="searchQuery"> • Showing results for "{{ searchQuery }}"</span>
          </p>
        </div>
        
        <div class="actions-section d-flex align-center gap-md">
          <!-- Search -->
          <div class="search-wrapper">
            <mat-form-field appearance="outline" class="search-field">
              <mat-icon matPrefix>search</mat-icon>
              <input 
                matInput 
                placeholder="Search compounds" 
                [(ngModel)]="searchQuery"
                (keyup.enter)="searchCompounds()"
              >
              <button 
                *ngIf="searchQuery" 
                matSuffix 
                mat-icon-button 
                aria-label="Clear" 
                (click)="clearSearch()"
              >
                <mat-icon>close</mat-icon>
              </button>
            </mat-form-field>
          </div>
          
          <!-- View Toggles -->
          <div class="view-toggle">
            <button 
              mat-button
              [class.active-view]="!isGalleryView"
              (click)="toggleView(false)"
              class="view-button"
              aria-label="List View"
              matTooltip="List View"
            >
              <mat-icon>view_list</mat-icon>
            </button>
            <button 
              mat-button
              [class.active-view]="isGalleryView"
              (click)="toggleView(true)"
              class="view-button"
              aria-label="Gallery View"
              matTooltip="Gallery View"
            >
              <mat-icon>grid_view</mat-icon>
            </button>
          </div>
          
          <!-- Admin Actions -->
          <button 
            *ngIf="isAdmin" 
            mat-flat-button 
            color="primary" 
            (click)="createCompound()"
            class="add-button"
          >
            <mat-icon>add</mat-icon>
            Add Compound
          </button>
          
          <!-- Bulk Actions (Admin Only) -->
          <button
            *ngIf="isAdmin && selectedCompounds.length > 0"
            mat-flat-button
            color="warn"
            (click)="confirmDeleteSelected()"
            class="action-button"
          >
            <mat-icon>delete</mat-icon>
            Delete Selected ({{ selectedCompounds.length }})
          </button>
        </div>
      </div>
      
      <!-- Refresh Message -->
      <div *ngIf="refreshMessage" class="refresh-notice">
        <mat-icon>check_circle</mat-icon>
        <span>{{ refreshMessage }}</span>
      </div>
      
      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state d-flex flex-column align-center justify-center">
        <mat-spinner diameter="40"></mat-spinner>
        <p class="loading-text">Loading compounds...</p>
      </div>
      
      <!-- Empty State -->
      <div *ngIf="!loading && compounds.length === 0" class="empty-state">
        <mat-icon class="empty-state-icon">science</mat-icon>
        <h2 class="empty-state-title">No compounds found</h2>
        <p class="empty-state-description" *ngIf="searchQuery">
          No results match your search "{{ searchQuery }}"
        </p>
        <p class="empty-state-description" *ngIf="!searchQuery">
          There are no compounds in the database yet
        </p>
        <div class="empty-state-actions">
          <button mat-flat-button color="primary" (click)="clearSearch()" *ngIf="searchQuery">
            Clear Search
          </button>
          <button mat-flat-button color="primary" (click)="createCompound()" *ngIf="isAdmin && !searchQuery">
            Add Your First Compound
          </button>
        </div>
      </div>
      
      <!-- List View -->
      <div *ngIf="!loading && compounds.length > 0 && !isGalleryView" 
           [@listAnimation]="compounds.length" 
           class="compounds-grid list-view">
        <mat-card 
          *ngFor="let compound of compounds" 
          class="compound-card card-animate"
          [class.selected]="isSelected(compound.id)"
        >
          <!-- Selection checkbox for admin -->
          <div class="selection-area" *ngIf="isAdmin">
            <mat-checkbox 
              (click)="$event.stopPropagation()"
              (change)="toggleSelection(compound.id)"
              [checked]="isSelected(compound.id)"
            ></mat-checkbox>
          </div>
          
          <!-- Card content that navigates to detail -->
          <div class="card-content" (click)="viewDetails(compound.id)">
            <div class="compound-image">
              <img 
                [src]="compound.imageSource || 'assets/images/compound-placeholder.png'" 
                [alt]="compound.name"
                (error)="onImageError($event)"
              >
            </div>
            
            <div class="compound-info">
              <h2 class="compound-name">{{ compound.name }}</h2>
              <p class="compound-description">{{ truncateDescription(compound.description) }}</p>
              
              <div class="card-actions">
                <span class="date-modified">Updated: {{ compound.dateModified | date:'mediumDate' }}</span>
                
                <div class="action-buttons" *ngIf="isAdmin">
                  <button mat-icon-button color="primary" 
                          (click)="editCompound(compound.id, $event)"
                          matTooltip="Edit">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" 
                          (click)="deleteCompound(compound.id, $event)"
                          matTooltip="Delete">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </mat-card>
      </div>
      
      <!-- Gallery View -->
      <div *ngIf="!loading && compounds.length > 0 && isGalleryView" 
           [@listAnimation]="compounds.length" 
           class="compounds-grid gallery-view">
        <mat-card 
          *ngFor="let compound of compounds" 
          class="gallery-card card-animate"
          [class.selected]="isSelected(compound.id)"
        >
          <!-- Selection overlay for admin -->
          <div class="selection-overlay" *ngIf="isAdmin">
            <mat-checkbox 
              (click)="$event.stopPropagation()"
              (change)="toggleSelection(compound.id)"
              [checked]="isSelected(compound.id)"
            ></mat-checkbox>
          </div>
          
          <div class="gallery-content" (click)="viewDetails(compound.id)">
            <!-- Image Container -->
            <div class="gallery-image-container">
              <img 
                [src]="compound.imageSource || 'assets/images/compound-placeholder.png'" 
                [alt]="compound.name"
                class="gallery-image"
                (error)="onImageError($event)"
              >
            </div>
            
            <!-- Content Overlay -->
            <div class="gallery-info-overlay">
              <h3 class="gallery-name">{{ compound.name }}</h3>
              
              <!-- Admin Actions -->
              <div class="gallery-actions" *ngIf="isAdmin">
                <button mat-mini-fab color="primary" 
                        (click)="editCompound(compound.id, $event)"
                        matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-mini-fab color="warn" 
                        (click)="deleteCompound(compound.id, $event)"
                        matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </mat-card>
      </div>
      
      <!-- Pagination -->
      <mat-paginator
        *ngIf="totalItems > pageSize"
        [length]="totalItems"
        [pageSize]="pageSize"
        [pageSizeOptions]="[10, 20, 50, 100]"
        [pageIndex]="currentPage - 1"
        (page)="onPageChange($event)"
        class="paginator"
        aria-label="Select page of compounds"
      ></mat-paginator>
      
      <!-- Floating Action Button for Mobile (Admin Only) -->
      <button 
        *ngIf="isAdmin" 
        mat-fab 
        color="primary" 
        class="fab-add"
        (click)="createCompound()"
        aria-label="Add new compound"
      >
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
  styleUrls: ['./compound-list.component.css'],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(15px)' }),
          stagger(60, [
            animate('400ms cubic-bezier(0.35, 0, 0.25, 1)', 
              style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class CompoundListComponent implements OnInit {
  compounds: Compound[] = [];
  totalItems = 0;
  currentPage = 1;
  pageSize = 20;
  loading = true;
  error: string | null = null;
  searchQuery: string = '';
  totalPages: number = 0;
  isAdmin: boolean = false;
  isGalleryView: boolean = false;
  refreshMessage: string = '';
  selectedCompounds: number[] = [];
  isMobile: boolean = false;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  constructor(
    private compoundService: CompoundService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.checkScreenSize();
    this.isAdmin = this.authService.isAdmin();
    
    this.route.url.subscribe(url => {
      this.isGalleryView = url.some(segment => segment.path === 'gallery');
    });
    
    this.route.queryParams.subscribe(params => {
      this.currentPage = params['page'] ? parseInt(params['page']) : 1;
      this.pageSize = params['limit'] ? parseInt(params['limit']) : 20;
      this.searchQuery = params['search'] || '';
      
      this.loadCompounds();
    });
    
    // Show welcome message for first-time visitors
    if (!localStorage.getItem('visited')) {
      this.refreshMessage = 'Welcome to the Chemical Compounds Manager!';
      localStorage.setItem('visited', 'true');
      setTimeout(() => {
        this.refreshMessage = '';
      }, 5000);
    }
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  loadCompounds(): void {
    this.loading = true;
    this.error = null;
    this.selectedCompounds = [];
    
    if (this.searchQuery) {
      this.compoundService.searchCompounds(this.searchQuery, this.currentPage, this.pageSize).pipe(
        catchError(error => {
          this.error = 'Failed to search compounds. Please try again.';
          this.snackBar.open(this.error, 'Close', { duration: 5000 });
          return of({ compounds: [], totalPages: 0, currentPage: 1, totalItems: 0 });
        }),
        finalize(() => {
          this.loading = false;
        })
      ).subscribe(data => {
        this.compounds = data.compounds;
        this.totalItems = data.totalItems;
        this.totalPages = data.totalPages;
      });
    } else {
      this.compoundService.getCompounds(this.currentPage, this.pageSize).pipe(
        catchError(error => {
          this.error = 'Failed to load compounds. Please try again.';
          this.snackBar.open(this.error, 'Close', { duration: 5000 });
          return of({ compounds: [], totalPages: 0, currentPage: 1, totalItems: 0 });
        }),
        finalize(() => {
          this.loading = false;
        })
      ).subscribe(data => {
        this.compounds = data.compounds;
        this.totalItems = data.totalItems;
        this.totalPages = data.totalPages;
      });
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    
    const queryParams: any = {
      page: this.currentPage,
      limit: this.pageSize
    };
    
    if (this.searchQuery) {
      queryParams.search = this.searchQuery;
    }
    
    this.router.navigate([], { 
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
  }

  searchCompounds(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate([], { 
        relativeTo: this.route,
        queryParams: { 
          search: this.searchQuery,
          page: 1,
          limit: this.pageSize
        },
        queryParamsHandling: 'merge'
      });
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.router.navigate([], { 
      relativeTo: this.route,
      queryParams: { 
        search: null,
        page: 1,
        limit: this.pageSize
      },
      queryParamsHandling: 'merge'
    });
  }

  toggleView(isGallery: boolean): void {
    this.isGalleryView = isGallery;
    
    // Update URL without reload
    const segments = this.router.url.split('?')[0].split('/');
    const baseUrl = segments.slice(0, segments.length - (this.isGalleryView ? 0 : 1)).join('/');
    const targetUrl = this.isGalleryView ? `${baseUrl}/gallery` : baseUrl;
    
    this.router.navigate([targetUrl], { 
      queryParams: { 
        page: this.currentPage,
        limit: this.pageSize,
        search: this.searchQuery || null
      },
      queryParamsHandling: 'merge'
    });
  }

  createCompound(): void {
    this.router.navigate(['/compounds/new']);
  }

  viewDetails(id: number): void {
    this.router.navigate(['/compounds', id]);
  }

  editCompound(id: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/compounds', id, 'edit']);
  }

  deleteCompound(id: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    if (confirm('Are you sure you want to delete this compound?')) {
      this.compoundService.deleteCompound(id).pipe(
        catchError(error => {
          this.snackBar.open('Failed to delete compound. Please try again.', 'Close', {
            duration: 5000
          });
          return of(null);
        })
      ).subscribe(
        () => {
          this.snackBar.open('Compound deleted successfully!', 'Close', {
            duration: 3000
          });
          this.loadCompounds();
        }
      );
    }
  }

  truncateDescription(description: string): string {
    return description && description.length > 120 
      ? `${description.substring(0, 120)}...` 
      : description;
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/compound-placeholder.png';
  }
  
  // Selection functionality for bulk actions
  toggleSelection(id: number): void {
    const index = this.selectedCompounds.indexOf(id);
    if (index === -1) {
      this.selectedCompounds.push(id);
    } else {
      this.selectedCompounds.splice(index, 1);
    }
  }
  
  isSelected(id: number): boolean {
    return this.selectedCompounds.indexOf(id) !== -1;
  }
  
  confirmDeleteSelected(): void {
    if (this.selectedCompounds.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${this.selectedCompounds.length} selected compounds? This action cannot be undone.`)) {
      // Delete compounds one by one
      const total = this.selectedCompounds.length;
      let deleted = 0;
      let failed = 0;
      
      this.selectedCompounds.forEach(id => {
        this.compoundService.deleteCompound(id).pipe(
          catchError(error => {
            failed++;
            if (deleted + failed === total) {
              this.showDeleteResults(deleted, failed);
            }
            return of(null);
          })
        ).subscribe(() => {
          deleted++;
          if (deleted + failed === total) {
            this.showDeleteResults(deleted, failed);
          }
        });
      });
    }
  }
  
  showDeleteResults(deleted: number, failed: number): void {
    if (failed === 0) {
      this.snackBar.open(`Successfully deleted ${deleted} compounds.`, 'Close', {
        duration: 3000
      });
    } else {
      this.snackBar.open(`Deleted ${deleted} compounds. Failed to delete ${failed} compounds.`, 'Close', {
        duration: 5000
      });
    }
    
    this.selectedCompounds = [];
    this.loadCompounds();
  }
} 