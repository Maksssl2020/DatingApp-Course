import { Component, computed, inject, OnInit } from '@angular/core';
import { MembersService } from '../../_services/members.service';
import { MemberCardComponent } from '../member-card/member-card.component';
import { NgClass } from '@angular/common';
import { AccountService } from '../../_services/account.service';
import { UserParams } from '../../_modules/UserParams';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [MemberCardComponent, NgClass],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.css',
})
export class MemberListComponent implements OnInit {
  private accountService = inject(AccountService);
  memberService = inject(MembersService);
  totalPages = computed(
    () => this.memberService.paginatedResult()?.pagination?.totalPages ?? 0
  );
  userParams = new UserParams(this.accountService.currentUser());

  ngOnInit(): void {
    if (!this.memberService.paginatedResult()) {
      this.loadMembers();
    }
  }

  loadMembers() {
    this.memberService.getMembers(this.userParams);
  }

  getPaginationListNumbers(value: number): number[] {
    let arr = [];

    for (let i = 0; i < value; i++) {
      arr.push(i);
    }

    return arr;
  }

  pageChanged(event: number) {
    if (this.userParams.pageNumber !== event) {
      this.userParams.pageNumber = event;
      this.loadMembers();
    }
  }
}
