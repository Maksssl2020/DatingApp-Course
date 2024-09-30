import {
  Component,
  ElementRef,
  inject,
  input,
  output,
  ViewChild,
} from '@angular/core';
import { Member } from '../../_modules/Member';
import { DecimalPipe, NgClass } from '@angular/common';
import { MembersService } from '../../_services/members.service';
import { Photo } from '../../_modules/Photo';
import { AccountService } from '../../_services/account.service';

@Component({
  selector: 'app-photo-editor',
  standalone: true,
  imports: [DecimalPipe, NgClass],
  templateUrl: './photo-editor.component.html',
  styleUrl: './photo-editor.component.css',
})
export class PhotoEditorComponent {
  private memberService = inject(MembersService);
  private accountService = inject(AccountService);
  @ViewChild('fileUpload') fileUpload?: ElementRef<HTMLInputElement>;
  member = input.required<Member>();
  memberChange = output<Member>();
  addedFiles: File[] = [];

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files) {
      this.stackFiles(event.dataTransfer.files);
    }
  }

  onFileSelected() {
    if (this.fileUpload?.nativeElement.files) {
      this.stackFiles(this.fileUpload.nativeElement.files);
    }
  }

  private stackFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      this.addedFiles.push(files[i]);
    }
  }

  uploadAllPhotos() {
    const formData = new FormData();

    if (this.addedFiles.length > 0) {
      this.addedFiles.forEach((file) => {
        formData.append('formFiles', file);
      });
    }

    this.memberService.uploadMemberPhoto(formData).subscribe({
      next: (response) => {
        const updatedMember = this.member();
        updatedMember.photos.push(...response);
        this.memberChange.emit(updatedMember);
        this.addedFiles = [];

        if (this.fileUpload?.nativeElement) {
          this.fileUpload.nativeElement.value = '';
        }
      },
    });
  }

  setMainPhoto(photo: Photo) {
    this.memberService.setMainPhoto(photo).subscribe({
      next: () => {
        const user = this.accountService.currentUser();

        if (user) {
          user.mainPhotoUrl = photo.url;
          this.accountService.setCurrentUser(user);
        }

        const updatedMember = { ...this.member() };
        updatedMember.photoUrl = photo.url;
        updatedMember.photos.forEach((userPhoto) => {
          if (userPhoto.isMain) {
            userPhoto.isMain = false;
          }
          if (userPhoto.id === photo.id) {
            userPhoto.isMain = true;
          }
        });

        this.memberChange.emit(updatedMember);
      },
    });
  }

  deletePhoto(photoId: number) {
    this.memberService.deletePhoto(photoId).subscribe({
      next: () => {
        const updatedMember = this.member();
        updatedMember.photos = updatedMember.photos.filter(
          (photo) => photo.id !== photoId
        );
        this.memberChange.emit(updatedMember);
      },
    });
  }
}
