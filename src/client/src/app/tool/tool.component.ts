import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import {
  Observable,
  combineLatest,
  delay,
  distinctUntilChanged,
  filter,
  skip,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { Tool } from './tool.model';
import { Response } from '../message/message.model';
import { AppState } from '../app.state';
import {
  createSession,
  loadSessionResponses,
  sendPrompt,
  addUserMessage
} from '../session/session.actions';
import { selectCurrentTool } from './tool.selectors';
import { selectUser } from '../user/user.selectors';
import { selectCurrentSession, selectSessionLoaded, selectSessionResponses } from '../session/session.selectors';
import { loadTool } from './tool.actions';
import { MarkdownEditorComponent, MdEditorOption } from 'ngx-markdown-editor';

@Component({
  selector: 'app-tool',
  templateUrl: './tool.component.html',
  styleUrls: ['./tool.component.scss']
})
export class ToolComponent implements OnInit {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild(MarkdownEditorComponent) editor!: MarkdownEditorComponent;

  tool!: Tool;
  userId!: string;
  sessionId: string | null = null;
  responses$: Observable<Response[]>;
  message: string = '';
  systemPromptShow: boolean = false;
  systemPromptOpen: boolean = false;
  loading: boolean = true;
  subscription: any;
  $first: any;
  modelName: string = 'gpt35'; // Default to "Fast"

  editorOptions: MdEditorOption = {
    showPreviewPanel: false,
    showBorder: true,
    hideIcons: ['TogglePreview', 'FullScreen'],
    usingFontAwesome5: true,
    scrollPastEnd: 0,
    enablePreviewContentClick: true,
    resizable: false,
    markedjsOpt: {
      breaks: true,
      gfm: true,
      tables: true,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: false
    },
    placeholder: 'Enter your markdown content here...',
    customIcons: {
      Bold: { fontClass: 'fa fa-bold' },
      Italic: { fontClass: 'fa fa-italic' },
      Heading: { fontClass: 'fa fa-header' },
      Reference: { fontClass: 'fa fa-quote-right' },
      Link: { fontClass: 'fa fa-link' },
      Image: { fontClass: 'fa fa-image' },
      UnorderedList: { fontClass: 'fa fa-list-ul' },
      OrderedList: { fontClass: 'fa fa-list-ol' },
      CodeBlock: { fontClass: 'fa fa-code' },
      ShowPreview: { fontClass: 'fa fa-eye' },
      HidePreview: { fontClass: 'fa fa-eye-slash' },
      FullScreen: { fontClass: 'fa fa-arrows-alt' }
    }
  };

  constructor(
    private route: ActivatedRoute,
    private store: Store<AppState>
  ) {
    this.responses$ = this.store.pipe(
      select(selectSessionResponses),
      tap(() => { this.loading = false; })
    );

    this.responses$.pipe(
      filter(responses => responses.length > 0),
      take(1),
      delay(10),
      tap(() => this.scrollToBottom())
    ).subscribe()
  }

  ngAfterViewInit(): void {
    console.log('scrolling to bottom')
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {

    const toolId = +this.route.snapshot.paramMap.get('id')!;

    // Set as current tool when app is loaded directly in this route
    this.store.select(selectCurrentTool).pipe(
      take(1),
      tap(tool => { if (!tool) this.store.dispatch(loadTool({ toolId })); }),
    ).subscribe();

    // Set the placeholder text from tool expected input
    this.store.select(selectCurrentTool).pipe(
      filter(tool => !!tool),
      take(1),
      tap(tool => {
        this.editorOptions =
        {
          ...this.editorOptions,
          placeholder: "Input: " + tool!.expectedInput
        }
      }),
    ).subscribe();

    // Store the user ID
    this.store.pipe(
      select(selectUser),
      take(1),
      tap(user => this.userId = user.userId)
    ).subscribe();

    // Create/load the session
    this.subscription = combineLatest([
      this.store.select(selectCurrentTool),
      this.store.select(selectSessionLoaded).pipe(
        filter(loaded => loaded),
        switchMap(() => this.store.select(selectCurrentSession)),
        distinctUntilChanged()
      )
    ])
      .subscribe(([tool, session]) => {
        if (!session || session.toolId !== toolId) {
          this.store.dispatch(createSession());
          this.store.select(selectCurrentSession).pipe(
            filter(session => session !== null),
            take(1),
            tap(session => {
              this.loadSession(session?.id!);
            })
          ).subscribe();
        } else if (session && tool) {
          this.tool = tool;
          this.loadSession(session?.id!);
        }
      });
  }

  private loadSession(id: string): void {
    this.sessionId = id;
    this.store.dispatch(loadSessionResponses({ sessionId: id }));
  }


  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Could not scroll to bottom:', err);
    }
  }

  private scrollToTop(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = 0;
    } catch (err) {
      console.error('Could not scroll to top:', err);
    }
  }

  sendMessage(): void {
    if (this.message.trim()) {
      const userMessage: Response = {
        sessionId: this.sessionId!,
        message: this.message,
        userId: this.userId,
        timestamp: new Date().toISOString(),
        modelName: this.modelName
      };

      this.store.dispatch(addUserMessage({ message: userMessage }));

      this.store.dispatch(sendPrompt({ sessionId: this.sessionId!, message: this.message }));

      this.loading = true;
      this.store.pipe(
        select(selectSessionResponses),
        skip(1), // this is the user's submitted message
        take(1) // this is the prompt response
      ).subscribe(() => {
        this.loading = false;
      });

      this.message = '';
    }
  }

  toggleSystemPrompt(): void {
    this.systemPromptShow = !this.systemPromptShow;
    if (this.systemPromptShow) this.scrollToTop();
  }

  addMessageToClipboard(message: Response): void {
    navigator.clipboard.writeText(message.message!);
  }

  onEditorLoaded(event: any) {
    // Implement any additional initialization logic here
    console.log('Editor loaded:', event);
  }

}
