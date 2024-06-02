import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Tool } from '../tool.model';

@Component({
  selector: 'tool-details-modal',
  templateUrl: './tool-details-modal.component.html',
  styleUrls: ['./tool-details-modal.component.scss']
})
export class ToolDetailsModalComponent {
  @Input() tool!: Tool;
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
}
