import { Component, inject, Input, input, OnInit, output } from '@angular/core';
import { User } from '../../_models/User';
import { AdminService } from '../../_services/admin.service';

@Component({
  selector: 'app-roles-modal',
  standalone: true,
  imports: [],
  templateUrl: './roles-modal.component.html',
  styleUrl: './roles-modal.component.css',
})
export class RolesModalComponent implements OnInit {
  private adminService = inject(AdminService);
  availableRoles = input.required<string[]>();
  user = input.required<User>();
  closeModal = output<void>();
  rolesUpdated = false;
  selectedRoles: string[] = [];

  ngOnInit(): void {
    this.selectedRoles = this.user().roles;
  }

  updateChecked(checkedValue: string) {
    if (this.selectedRoles.includes(checkedValue)) {
      this.selectedRoles = this.selectedRoles.filter((r) => r !== checkedValue);
    } else {
      this.selectedRoles.push(checkedValue);
    }
  }

  onSelectedRoles() {
    this.rolesUpdated = true;
    this.closeModalEmit();
  }

  closeModalEmit() {
    if (this.rolesUpdated) {
      this.adminService
        .updateUserRoles(this.user().username, this.selectedRoles)
        .subscribe({
          next: (roles) => {
            this.user().roles = roles;
          },
        });
    }

    this.closeModal.emit();
  }
}
