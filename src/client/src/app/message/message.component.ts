import { Component, Input } from '@angular/core';
import { Response } from './message.model';

@Component({
  selector: 'response-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent {
  @Input() response!: Response;
  @Input() userId!: string;

  isUserMessage(): boolean {
    return this.response.userId === this.userId;
  }
}
