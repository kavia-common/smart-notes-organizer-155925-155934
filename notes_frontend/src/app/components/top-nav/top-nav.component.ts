import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.css',
})
export class TopNavComponent {
  @Output() searchChange = new EventEmitter<string>();
  @Output() newNote = new EventEmitter<void>();

  onSearch(e: Event) {
    const target = e.target as HTMLInputElement;
    this.searchChange.emit(target.value ?? '');
  }

  onNewNote() {
    this.newNote.emit();
  }
}
