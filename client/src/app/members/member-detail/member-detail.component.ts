import { Component, inject, OnInit } from '@angular/core';
import { MembersService } from '../../_services/members.service';
import { ActivatedRoute } from '@angular/router';
import { Member } from '../../_models/Member';
import { DatePipe, NgClass } from '@angular/common';
import { GalleryItem, GalleryModule, ImageItem } from 'ng-gallery';
import { MemberMessagesComponent } from '../member-messages/member-messages.component';
import { Message } from '../../_models/Message';
import { MessageService } from '../../_services/message.service';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [NgClass, GalleryModule, DatePipe, MemberMessagesComponent],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.css',
})
export class MemberDetailComponent implements OnInit {
  private memberService = inject(MembersService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  member!: Member;
  images: GalleryItem[] = [];
  selectedTab = 'about';
  messages: Message[] = [];

  ngOnInit(): void {
    this.route.data.subscribe({
      next: (data) => {
        this.member = data['member'];
        this.member &&
          this.member.photos.map((photo) => {
            this.images.push(
              new ImageItem({ src: photo.url, thumb: photo.url })
            );
          });
      },
    });

    this.route.queryParams.subscribe({
      next: (params) => {
        if (params['tab']) {
          this.setSelectedTab(params['tab']);
        }
      },
    });
  }

  onUpdateMessages(event: Message) {
    this.messages.push(event);
  }

  isTabSelected(tabName: string): boolean {
    return tabName === this.selectedTab;
  }

  setSelectedTab(tabName: string) {
    this.selectedTab = tabName;

    if (tabName === 'messages' && this.messages.length === 0 && this.member) {
      this.messageService.getMessageThread(this.member.username).subscribe({
        next: (messages) => {
          this.messages = messages;
        },
      });
    }
  }
}
