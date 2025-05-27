import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CompoundGalleryComponent } from './compound-gallery.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('CompoundGalleryComponent', () => {
  let component: CompoundGalleryComponent;
  let fixture: ComponentFixture<CompoundGalleryComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompoundGalleryComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MatGridListModule,
        MatCardModule,
        MatPaginatorModule,
        BrowserAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompoundGalleryComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load compounds on init', () => {
    fixture.detectChanges();
    
    const req = httpMock.expectOne('http://localhost:3000/api/compounds?page=1');
    expect(req.request.method).toBe('GET');
    
    req.flush({
      compounds: [
        { id: 1, name: 'Compound 1', image: 'http://example.com/image1.png' },
        { id: 2, name: 'Compound 2', image: 'http://example.com/image2.png' }
      ],
      totalPages: 2,
      currentPage: 1
    });

    expect(component.compounds.length).toBe(2);
    expect(component.totalPages).toBe(2);
    expect(component.currentPage).toBe(1);
  });

  it('should navigate to compound details', () => {
    const router = TestBed.inject(Router);
    const routerSpy = spyOn(router, 'navigate');
    
    component.navigateToDetails(1);
    expect(routerSpy).toHaveBeenCalledWith(['/compounds', 1]);
  });

  it('should load new page on paginator change', () => {
    component.totalPages = 2;
    component.currentPage = 1;
    
    const pageEvent = { 
      pageIndex: 1, 
      pageSize: 10,
      length: 20,
      previousPageIndex: 0
    };
    
    component.onPageChange(pageEvent);
    
    const req = httpMock.expectOne('http://localhost:3000/api/compounds?page=2');
    expect(req.request.method).toBe('GET');
    
    req.flush({
      compounds: [{ id: 11, name: 'Compound 11', image: 'http://example.com/image11.png' }],
      totalPages: 2,
      currentPage: 2
    });

    expect(component.currentPage).toBe(2);
    expect(component.compounds.length).toBe(1);
  });
}); 