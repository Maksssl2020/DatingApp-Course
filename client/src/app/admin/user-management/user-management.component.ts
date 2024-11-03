import { Component, inject, OnInit } from '@angular/core';
import { AdminService } from '../../_services/admin.service';
import { User } from '../../_models/User';
import { RolesModalComponent } from '../../modals/roles-modal/roles-modal.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [RolesModalComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css',
})
export class UserManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  users: User[] = [];
  isModalOpen: boolean = false;
  selectedUser?: User;

  ngOnInit(): void {
    this.loadUsersWithRoles();
  }

  loadUsersWithRoles() {
    this.adminService.getUserWithRoles().subscribe({
      next: (users) => {
        this.users = users;
      },
    });
  }

  openModal(user: User) {
    this.isModalOpen = true;
    this.selectedUser = user;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
