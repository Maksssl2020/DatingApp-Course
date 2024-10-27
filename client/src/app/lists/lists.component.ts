import { Component, computed, inject, OnInit } from '@angular/core';
import { LikesService } from '../_services/likes.service';
import { Member } from '../_modules/Member';
import { MemberCardComponent } from '../members/member-card/member-card.component';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [MemberCardComponent, FormsModule, NgClass],
  templateUrl: './lists.component.html',
  styleUrl: './lists.component.css',
})
export class ListsComponent implements OnInit {
  likeService = inject(LikesService);
  predicate = '';
  activeButton = 'liked';
  totalPages = computed(
    () => this.likeService.paginatedResult()?.pagination?.totalPages ?? 0
  );
  pageNumber = 1;
  pageSize = 6;

  ngOnInit(): void {
    this.loadLikes();
  }

  getTitle() {
    switch (this.predicate) {
      case 'liked':
        return 'Members you like';
      case 'likedBy':
        return 'Members who like you';
      default:
        return 'Mutual';
    }
  }

  setActiveButton(button: string) {
    this.activeButton = button;
  }

  loadLikes() {
    this.predicate = this.activeButton;

    this.likeService.getLikes(this.predicate, this.pageNumber, this.pageSize);
  }

  getPaginationListNumbers(value: number): number[] {
    console.log(value);
    let arr = [];

    for (let i = 0; i < value; i++) {
      arr.push(i);
    }

    return arr;
  }

  pageChanged(event: number) {
    if (this.pageNumber !== event) {
      this.pageNumber = event;
      console.log(event);
      this.loadLikes();
    }
  }
}
