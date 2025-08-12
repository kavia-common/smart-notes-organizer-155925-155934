import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  @Input() folders: string[] = ['All Notes'];
  @Input() selectedFolder: string | null = 'All Notes';
  @Output() folderChange = new EventEmitter<string>();

  onSelect(folder: string) {
    this.folderChange.emit(folder);
  }
}
