/* eslint-env browser */
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { Note } from '../models/note.model';

const STORAGE_KEY = 'smart-notes-notes-v1';

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

@Injectable({ providedIn: 'root' })
export class NoteService {
  private _notes$ = new BehaviorSubject<Note[]>([]);
  private _selectedNoteId$ = new BehaviorSubject<string | null>(null);
  private _searchQuery$ = new BehaviorSubject<string>('');
  private _selectedFolder$ = new BehaviorSubject<string>('All Notes');

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor() {
    if (this.isBrowser) {
      // Load from localStorage only in the browser
      const saved = (globalThis as any).localStorage?.getItem(STORAGE_KEY) ?? null;
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Note[];
          this._notes$.next(parsed);
        } catch {
          // ignore corrupt storage
        }
      }

      // Persist to localStorage on every change
      this._notes$.subscribe((notes) => {
        try {
          (globalThis as any).localStorage?.setItem(STORAGE_KEY, JSON.stringify(notes));
        } catch {
          // ignore write errors
        }
      });
    }
  }

  // PUBLIC_INTERFACE
  /** Returns an observable of all notes. */
  public notes$(): Observable<Note[]> {
    return this._notes$.asObservable();
  }

  // PUBLIC_INTERFACE
  /** Returns the observable of the current selected note id. */
  public selectedNoteId$(): Observable<string | null> {
    return this._selectedNoteId$.asObservable();
  }

  // PUBLIC_INTERFACE
  /** Returns the observable of the current selected note object (or null). */
  public selectedNote$(): Observable<Note | null> {
    return combineLatest([this._notes$, this._selectedNoteId$]).pipe(
      map(([notes, id]) => (id ? notes.find((n) => n.id === id) || null : null)),
    );
  }

  // PUBLIC_INTERFACE
  /** Returns the observable of the current search query. */
  public searchQuery$(): Observable<string> {
    return this._searchQuery$.asObservable();
  }

  // PUBLIC_INTERFACE
  /** Returns the observable of the selected folder name. */
  public selectedFolder$(): Observable<string> {
    return this._selectedFolder$.asObservable();
  }

  // PUBLIC_INTERFACE
  /** Returns a derived observable of unique folders, with 'All Notes' prepended. */
  public folders$(): Observable<string[]> {
    return this._notes$.pipe(
      map((notes) => {
        const set = new Set<string>();
        for (const n of notes) {
          if (n.folder && n.folder.trim().length > 0) set.add(n.folder.trim());
        }
        return ['All Notes', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
      }),
    );
  }

  // PUBLIC_INTERFACE
  /** Returns filtered notes based on search query and selected folder, sorted by updatedAt desc. */
  public filteredNotes$(): Observable<Note[]> {
    return combineLatest([this._notes$, this._searchQuery$, this._selectedFolder$]).pipe(
      map(([notes, q, folder]) => {
        const query = q.trim().toLowerCase();
        let result = [...notes];

        if (folder && folder !== 'All Notes') {
          result = result.filter((n) => (n.folder || '').toLowerCase() === folder.toLowerCase());
        }

        if (query.length > 0) {
          result = result.filter((n) => {
            const hay = `${n.title} ${n.content}`.toLowerCase();
            return hay.includes(query);
          });
        }

        // Pinned at top, then by updatedAt desc
        result.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

        return result;
      }),
    );
  }

  // PUBLIC_INTERFACE
  /** Sets the current search query string. */
  public setSearchQuery(query: string): void {
    this._searchQuery$.next(query);
  }

  // PUBLIC_INTERFACE
  /** Sets the selected folder for filtering. */
  public setSelectedFolder(folder: string): void {
    this._selectedFolder$.next(folder || 'All Notes');
  }

  // PUBLIC_INTERFACE
  /** Selects a note by id (or null to unselect). */
  public selectNote(noteId: string | null): void {
    this._selectedNoteId$.next(noteId);
  }

  // PUBLIC_INTERFACE
  /** Creates a new note and selects it. Optionally specify initial values. */
  public createNote(initial?: Partial<Note>): Note {
    const now = new Date().toISOString();
    const note: Note = {
      id: generateId(),
      title: initial?.title ?? 'Untitled Note',
      content: initial?.content ?? '',
      folder: initial?.folder ?? '',
      createdAt: now,
      updatedAt: now,
      pinned: initial?.pinned ?? false,
    };
    const next = [note, ...this._notes$.value];
    this._notes$.next(next);
    this.selectNote(note.id);
    return note;
  }

  // PUBLIC_INTERFACE
  /** Updates an existing note by id. No-op if not found. */
  public updateNote(updated: Note): void {
    const next = this._notes$.value.map((n) =>
      n.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : n,
    );
    this._notes$.next(next);
  }

  // PUBLIC_INTERFACE
  /** Deletes a note by id. Also clears selection if it was selected. */
  public deleteNote(noteId: string): void {
    const next = this._notes$.value.filter((n) => n.id !== noteId);
    this._notes$.next(next);
    if (this._selectedNoteId$.value === noteId) {
      this.selectNote(null);
    }
  }

  // PUBLIC_INTERFACE
  /** Toggles pinned state for a note by id. */
  public togglePinned(noteId: string): void {
    const next = this._notes$.value.map((n) =>
      n.id === noteId ? { ...n, pinned: !n.pinned, updatedAt: new Date().toISOString() } : n,
    );
    this._notes$.next(next);
  }
}
