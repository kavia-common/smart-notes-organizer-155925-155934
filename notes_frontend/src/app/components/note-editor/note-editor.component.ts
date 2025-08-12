import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-editor.component.html',
  styleUrl: './note-editor.component.css',
})
export class NoteEditorComponent implements OnChanges {
  @Input() note: Note | null = null;

  @Output() saveNote = new EventEmitter<Note>();
  @Output() deleteNote = new EventEmitter<string>();

  model: Note | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['note']) {
      // Make a shallow copy for editing without mutating the input directly
      this.model = this.note ? { ...this.note } : null;
    }
  }

  onSave() {
    if (this.model) {
      // Normalize fields
      this.model.title = (this.model.title || '').trim() || 'Untitled Note';
      this.model.folder = (this.model.folder || '').trim();
      this.saveNote.emit(this.model);
    }
  }

  onDelete() {
    if (this.model) {
      this.deleteNote.emit(this.model.id);
    }
  }
}
