import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompoundService, Compound } from '../../services/compound.service';

@Component({
  selector: 'app-compound-gallery',
  templateUrl: './compound-gallery.component.html',
  styleUrls: ['./compound-gallery.component.css']
})
export class CompoundGalleryComponent implements OnInit {
  compounds: Compound[] = [];
  totalPages = 0;
  currentPage = 1;
  totalItems = 0;
  loading = false;
  searchQuery = '';
  private searchSubject = new Subject<string>();
  private defaultImage = 'assets/images/compound-placeholder.png';

  constructor(
    private compoundService: CompoundService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadCompounds();
    });
  }

  ngOnInit(): void {
    this.loadCompounds();
  }

  loadCompounds(): void {
    this.loading = true;
    if (this.searchQuery) {
      this.compoundService.searchCompounds(this.searchQuery).subscribe({
        next: (response) => {
          this.compounds = response.compounds;
          this.totalPages = response.totalPages;
          this.currentPage = response.currentPage;
          this.totalItems = response.totalItems;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error searching compounds:', error);
          this.loading = false;
          this.showError('Error searching compounds');
        }
      });
    } else {
      this.compoundService.getCompounds(this.currentPage).subscribe({
        next: (response) => {
          this.compounds = response.compounds;
          this.totalPages = response.totalPages;
          this.currentPage = response.currentPage;
          this.totalItems = response.totalItems;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading compounds:', error);
          this.loading = false;
          this.showError('Error loading compounds');
        }
      });
    }
  }

  onSearch(): void {
    this.searchSubject.next(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadCompounds();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.loadCompounds();
  }

  onImageError(event: any): void {
    event.target.src = this.defaultImage;
  }

  deleteCompound(id: number): void {
    if (confirm('Are you sure you want to delete this compound?')) {
      this.compoundService.deleteCompound(id).subscribe({
        next: () => {
          this.showSuccess('Compound deleted successfully');
          this.loadCompounds();
        },
        error: (error) => {
          console.error('Error deleting compound:', error);
          this.showError('Error deleting compound');
        }
      });
    }
  }

  editCompound(id: number): void {
    this.router.navigate(['/compounds/edit', id]);
  }

  createCompound(): void {
    this.router.navigate(['/compounds/create']);
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
} 