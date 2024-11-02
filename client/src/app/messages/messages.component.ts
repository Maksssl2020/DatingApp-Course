import { Component, computed, inject, OnInit } from '@angular/core';
import { MessageService } from '../_services/message.service';
import { TimeagoModule } from 'ngx-timeago';
import { NgClass } from '@angular/common';
import { Message } from '../_models/Message';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [TimeagoModule, NgClass, RouterLink],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css',
})
export class MessagesComponent implements OnInit {
  messageService = inject(MessageService);
  container = 'Inbox';
  totalPages = computed(
    () => this.messageService.paginatedResult()?.pagination?.totalPages ?? 0
  );
  pageNumber = 1;
  pageSize = 5;

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages() {
    this.messageService.getMessages(
      this.pageNumber,
      this.pageSize,
      this.container
    );
  }

  deleteMessage(id: number) {
    this.messageService.deleteMessage(id).subscribe({
      next: () => {
        this.messageService.paginatedResult.update((previous) => {
          if (previous && previous.items) {
            previous.items.splice(
              previous.items.findIndex((m) => m.id === id),
              1
            );

            return previous;
          }

          return previous;
        });
      },
    });
  }

  getRoute(message: Message) {
    if (this.container === 'Outbox') {
      return `/members/${message.recipientUsername}`;
    } else {
      return `/members/${message.senderUsername}`;
    }
  }

  getPaginationListNumbers(value: number): number[] {
    console.log(value);
    let arr = [];

    for (let i = 0; i < value; i++) {
      arr.push(i);
    }

    return arr;
  }

  pageChanged(event: any) {
    if (this.pageNumber !== event) {
      this.pageNumber = event;
      this.loadMessages();
    }
  }
}
