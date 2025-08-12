import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notes-list.component.html',
  styleUrl: './notes-list.component.css',
})
export class NotesListComponent {
  @Input() notes: Note[] | null = [];
  @Input() selectedNoteId: string | null = null;

  @Output() selectNote = new EventEmitter<string>();
  @Output() deleteNote = new EventEmitter<string>();
  @Output() togglePinned = new EventEmitter<string>();

  trackById = (_: number, n: Note) => n.id;

  onSelect(id: string) {
    this.selectNote.emit(id);
  }

  onDelete(id: string, e: MouseEvent) {
    e.stopPropagation();
    this.deleteNote.emit(id);
  }

  onTogglePinned(id: string, e: MouseEvent) {
    e.stopPropagation();
    this.togglePinned.emit(id);
  }
}
