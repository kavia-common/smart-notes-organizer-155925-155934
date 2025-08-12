import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopNavComponent } from './components/top-nav/top-nav.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NotesListComponent } from './components/notes-list/notes-list.component';
import { NoteEditorComponent } from './components/note-editor/note-editor.component';
import { NoteService } from './services/note.service';
import { Observable } from 'rxjs';
import { Note } from './models/note.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TopNavComponent, SidebarComponent, NotesListComponent, NoteEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  // Inject service in a field to safely use in property initializers
  private noteService = inject(NoteService);

  // Streams provided by the service
  filteredNotes$ = this.noteService.filteredNotes$();
  folders$ = this.noteService.folders$();
  selectedFolder$ = this.noteService.selectedFolder$();
  selectedNoteId$ = this.noteService.selectedNoteId$();
  selectedNote$: Observable<Note | null> = this.noteService.selectedNote$();

  onSearch(query: string) {
    this.noteService.setSearchQuery(query);
  }

  onNewNote() {
    this.noteService.createNote();
  }

  onFolderChange(folder: string) {
    this.noteService.setSelectedFolder(folder);
  }

  onSelectNote(id: string) {
    this.noteService.selectNote(id);
  }

  onDeleteNote(id: string) {
    this.noteService.deleteNote(id);
  }

  onTogglePinned(id: string) {
    this.noteService.togglePinned(id);
  }

  onSaveNote(note: Note) {
    this.noteService.updateNote(note);
  }
}
