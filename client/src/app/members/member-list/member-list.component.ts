import { NgClass } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MembersService } from '../../_services/members.service';
import { MemberCardComponent } from '../member-card/member-card.component';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [MemberCardComponent, NgClass, FormsModule],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.css',
})
export class MemberListComponent implements OnInit {
  memberService = inject(MembersService);
  totalPages = computed(
    () => this.memberService.paginatedResult()?.pagination?.totalPages ?? 0
  );
  genderList = [
    { value: 'male', display: 'Males' },
    { value: 'female', display: 'Females' },
  ];
  currentPage: number = 1;

  ngOnInit(): void {
    if (!this.memberService.paginatedResult()) {
      this.loadMembers();
    } else {
      const savedPage = localStorage.getItem('currentMembersPage');
      this.currentPage = savedPage ? +savedPage : 1;
      this.memberService.userParams().pageNumber = this.currentPage;
    }
  }

  loadMembers() {
    this.memberService.getMembers();
  }

  resetFilters() {
    this.memberService.resetUserParams();
    this.loadMembers();
  }

  getPaginationListNumbers(value: number): number[] {
    let arr = [];

    for (let i = 0; i < value; i++) {
      arr.push(i);
    }

    return arr;
  }

  pageChanged(event: number) {
    if (this.memberService.userParams().pageNumber !== event) {
      this.currentPage = event;
      this.memberService.userParams().pageNumber = this.currentPage;
      this.loadMembers();

      localStorage.setItem('currentMembersPage', this.currentPage.toString());
    }
  }
}
