import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { NgIf } from '@angular/common';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
  animations: [
    trigger('openCloseDropdown', [
      state(
        'open',
        style({
          maxHeight: '200px',
          opacity: 1,
        })
      ),
      state(
        'closed',
        style({
          height: '0px',
          opacity: 0,
        })
      ),
      transition('open => closed', [animate('0.1s')]),
      transition('closed => open', [animate('0.3s')]),
    ]),
  ],
})
export class NavBarComponent {
  accountService = inject(AccountService);
  isDropdownOpen = false;
  model: any = {};

  login() {
    this.accountService.login(this.model).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (err) => console.log(err),
    });
  }

  logout() {
    this.accountService.logout();
  }

  toogleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
}
