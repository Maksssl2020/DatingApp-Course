import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Member } from '../_modules/Member';
import { map, Observable, of, tap } from 'rxjs';
import { formatDate } from '@angular/common';
import { Photo } from '../_modules/Photo';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;
  members = signal<Member[]>([]);

  getMembers() {
    return this.http.get<Member[]>(this.baseUrl + 'users').subscribe({
      next: (members) => this.members.set(members),
    });
  }

  getMember(username: string) {
    const member = this.members().find(
      (member) => member.username === username
    );

    if (member !== undefined) {
      return of(member);
    }

    return this.http.get<Member>(
      this.baseUrl + 'users/get-by-username/' + username
    );
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      tap(() => {
        this.members.update((members) =>
          members.map((m) => (m.username === member.username ? member : m))
        );
      })
    );
  }

  uploadMemberPhoto(photos: FormData) {
    return this.http.post<Photo[]>(this.baseUrl + 'users/add-photos', photos);
  }

  setMainPhoto(photo: Photo) {
    return this.http
      .put(this.baseUrl + 'users/set-main-photo/' + photo.id, {})
      .pipe(
        tap(() => {
          this.members.update((members) =>
            members.map((member) => {
              if (member.photos.includes(photo)) {
                member.photoUrl = photo.url;
              }

              return member;
            })
          );
        })
      );
  }

  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }
}
