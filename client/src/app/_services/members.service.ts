import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Member } from '../_modules/Member';
import { PaginatedResult } from '../_modules/Pagination';
import { Photo } from '../_modules/Photo';
import { UserParams } from '../_modules/UserParams';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;
  paginatedResult = signal<PaginatedResult<Member[]> | null>(null);

  getMembers(userParams: UserParams) {
    let params = this.setPaginationHeaders(
      userParams.pageNumber,
      userParams.pageSize
    );

    params = params.append('minAge', userParams.minAge);
    params = params.append('maxAge', userParams.maxAge);
    params = params.append('gender', userParams.gender);

    return this.http
      .get<Member[]>(this.baseUrl + 'users', { observe: 'response', params })
      .subscribe({
        next: (response) => {
          this.paginatedResult.set({
            items: response.body as Member[],
            pagination: JSON.parse(response.headers.get('Pagination')!),
          });
        },
      });
  }

  private setPaginationHeaders(pageNumber: number, pageSize: number) {
    let params = new HttpParams();

    if (pageNumber && pageSize) {
      params = params.append('pageNumber', pageNumber);
      params = params.append('pageSize', pageSize);
    }

    return params;
  }

  getMember(username: string) {
    // const member = this.members().find(
    //   (member) => member.username === username
    // );

    // if (member !== undefined) {
    //   return of(member);
    // }

    return this.http.get<Member>(
      this.baseUrl + 'users/get-by-username/' + username
    );
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member);
    // .pipe(
    //   tap(() => {
    //     this.members.update((members) =>
    //       members.map((m) => (m.username === member.username ? member : m))
    //     );
    //   })
    // );
  }

  uploadMemberPhoto(photos: FormData) {
    return this.http.post<Photo[]>(this.baseUrl + 'users/add-photos', photos);
  }

  setMainPhoto(photo: Photo) {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photo.id, {});
    // .pipe(
    //   tap(() => {
    //     this.members.update((members) =>
    //       members.map((member) => {
    //         if (member.photos.includes(photo)) {
    //           member.photoUrl = photo.url;
    //         }

    //         return member;
    //       })
    //     );
    //   })
    // );
  }

  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }
}
