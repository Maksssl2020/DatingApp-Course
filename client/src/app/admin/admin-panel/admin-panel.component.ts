import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { UserManagementComponent } from '../user-management/user-management.component';
import { PhotoManagementComponent } from '../photo-management/photo-management.component';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [NgClass, UserManagementComponent, PhotoManagementComponent],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css',
})
export class AdminPanelComponent {
  selectedTab = 'userManagement';

  setSelectedTab(tabName: string) {
    this.selectedTab = tabName;
  }

  isTabSelected(tabName: string): boolean {
    return this.selectedTab === tabName;
  }
}
