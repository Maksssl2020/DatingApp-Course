import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Member } from '../_models/Member';
import { PaginatedResult } from '../_models/Pagination';
import { setPaginatedResponse, setPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root',
})
export class LikesService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;
  likeIds = signal<number[]>([]);
  paginatedResult = signal<PaginatedResult<Member[]> | null>(null);

  toggleLike(targetId: number) {
    return this.http.post(`${this.baseUrl}likes/${targetId}`, {});
  }

  getLikes(predicate: string, pageNumber: number, pageSize: number) {
    let params = setPaginationHeaders(pageNumber, pageSize);
    console.log(pageNumber, pageSize);

    params = params.append('predicate', predicate);

    return this.http
      .get<Member[]>(`${this.baseUrl}likes`, { observe: 'response', params })
      .subscribe({
        next: (response) => {
          console.log(response);
          setPaginatedResponse(response, this.paginatedResult);
          console.log(this.paginatedResult()?.pagination);
        },
      });
  }

  getLikeIds() {
    return this.http.get<number[]>(`${this.baseUrl}likes/list`).subscribe({
      next: (ids) => this.likeIds.set(ids),
    });
  }
}
