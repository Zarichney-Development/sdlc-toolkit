import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Tool } from '../tool.model';

@Component({
  selector: 'tool-system-prompt-modal',
  templateUrl: './tool-system-prompt-modal.component.html',
  styleUrls: ['./tool-system-prompt-modal.component.scss']
})
export class ToolSystemPromptModalComponent {
  @Input() tool!: Tool;
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }

  saveSystemPrompt() {
  }

}
