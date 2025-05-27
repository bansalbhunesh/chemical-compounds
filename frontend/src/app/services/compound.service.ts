import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import environment from '../../environments/environment';

export interface CompoundDTO {
  id: number;
  CompoundName: string;
  CompoundDescription: string;
  strImageSource: string;
  strImageAttribution: string;
  dateModified: string;
}

export interface Compound {
  id: number;
  name: string;
  description: string;
  imageSource: string;
  imageAttribution: string;
  dateModified: Date;
}

export interface CompoundResponse {
  compounds: CompoundDTO[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

@Injectable({
  providedIn: 'root'
})
export class CompoundService {
  private apiUrl = `${environment.apiUrl}/compounds`;

  constructor(private http: HttpClient) { }

  private mapCompound(dto: CompoundDTO): Compound {
    return {
      id: dto.id,
      name: dto.CompoundName,
      description: dto.CompoundDescription,
      imageSource: dto.strImageSource,
      imageAttribution: dto.strImageAttribution,
      dateModified: new Date(dto.dateModified)
    };
  }

  getCompounds(page: number = 1, limit: number = 10): Observable<{ compounds: Compound[]; totalPages: number; currentPage: number; totalItems: number }> {
    return this.http.get<CompoundResponse>(`${this.apiUrl}?page=${page}&limit=${limit}`).pipe(
      map(response => ({
        compounds: response.compounds.map(this.mapCompound),
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        totalItems: response.totalItems
      }))
    );
  }

  searchCompounds(query: string, page: number = 1, limit: number = 10): Observable<{ compounds: Compound[]; totalPages: number; currentPage: number; totalItems: number }> {
    return this.http.get<CompoundResponse>(`${this.apiUrl}/search/${encodeURIComponent(query)}?page=${page}&limit=${limit}`).pipe(
      map(response => ({
        compounds: response.compounds.map(this.mapCompound),
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        totalItems: response.totalItems
      }))
    );
  }

  getCompound(id: number): Observable<Compound> {
    return this.http.get<CompoundDTO>(`${this.apiUrl}/${id}`).pipe(
      map(this.mapCompound)
    );
  }

  createCompound(compound: Partial<Compound>): Observable<Compound> {
    const dto = {
      CompoundName: compound.name,
      CompoundDescription: compound.description,
      strImageSource: compound.imageSource,
      strImageAttribution: compound.imageAttribution
    };
    return this.http.post<CompoundDTO>(this.apiUrl, dto).pipe(
      map(this.mapCompound)
    );
  }

  updateCompound(id: number, compound: Partial<Compound>): Observable<Compound> {
    const dto = {
      CompoundName: compound.name,
      CompoundDescription: compound.description,
      strImageSource: compound.imageSource,
      strImageAttribution: compound.imageAttribution
    };
    return this.http.put<CompoundDTO>(`${this.apiUrl}/${id}`, dto).pipe(
      map(this.mapCompound)
    );
  }

  deleteCompound(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 