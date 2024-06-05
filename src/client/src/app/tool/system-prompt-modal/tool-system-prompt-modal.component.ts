import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs';
import { AppState } from 'src/app/app.state';
import { ApiService } from 'src/app/services/api.service';
import { updateSystemPrompt } from 'src/app/session/session.actions';
import { Session } from 'src/app/session/session.model';

@Component({
  selector: 'tool-system-prompt-modal',
  templateUrl: './tool-system-prompt-modal.component.html',
  styleUrls: ['./tool-system-prompt-modal.component.scss']
})
export class ToolSystemPromptModalComponent {
  @Input() session!: Session;
  @Output() close = new EventEmitter<void>();

  editedSystemPrompt: string = "";

  constructor(
    private apiService: ApiService,
    private store: Store<AppState>
  ) { }

  ngOnInit(): void {
    this.editedSystemPrompt = this.session.systemPrompt;
  }

  closeModal() {
    this.close.emit();
  }

  saveSystemPrompt() {
    if (this.editedSystemPrompt.trim()) {
      this.apiService.updateSession(this.session.id, this.editedSystemPrompt).pipe(
        tap(_ => {
          this.store.dispatch(updateSystemPrompt({ session: this.session, systemPrompt: this.editedSystemPrompt }));
          this.closeModal();
        })
      ).subscribe();
    }
  }

}

