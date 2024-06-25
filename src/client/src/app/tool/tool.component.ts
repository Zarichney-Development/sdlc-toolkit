import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import {
  Observable,
  combineLatest,
  delay,
  distinctUntilChanged,
  filter,
  map,
  skip,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs';
import { Tool } from './tool.model';
import { Response } from '../message/message.model';
import { AppState } from '../app.state';
import {
  createSession,
  loadSessionResponses,
  sendPrompt,
  addUserMessage,
  fetchLatestSession
} from '../session/session.actions';
import { selectCurrentTool, selectToolLoaded } from './tool.selectors';
import { selectUser } from '../user/user.selectors';
import { selectCurrentSession, selectSessionLoaded, selectSessionLoading, selectSessionResponses } from '../session/session.selectors';
import { loadTool } from './tool.actions';
import { MarkdownEditorComponent, MdEditorOption } from 'ngx-markdown-editor';
import { Session } from '../session/session.model';

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
  session!: Session;
  responses$: Observable<Response[]>;
  message: string = '';
  systemPromptShow: boolean = false;
  systemPromptOpen: boolean = false;
  loading: boolean = true;
  subscription: any;
  $first: any;
  modelName: string = 'gpt40'; // Default to "Quality"

  editorOptions: MdEditorOption = {
    showPreviewPanel: false,
    showBorder: true,
    hideIcons: ['Link', 'Image'],
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
      withLatestFrom(this.store.select(selectCurrentSession)),
      filter(([responses, session]) => !!session),
      map(([responses, session]) => {

        if (responses.length > 0) {
          return responses;
        }

        // Before the conversation begins, prepend the edit-able system prompt
        const systemPrompt: Response = {
          sessionId: session!.id,
          message: session!.systemPrompt,
          userId: null,
          id: "",
          timestamp: "",
          modelName: ""
        };

        return [systemPrompt];
      }),
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
    this.subscription =
      this.store.select(selectToolLoaded).pipe(
        filter(loaded => loaded === true),
        switchMap(() => this.store.select(selectCurrentTool)),
        tap(tool => this.tool = tool!),
        switchMap(tool => this.store.select(selectCurrentSession)),
        distinctUntilChanged(),
        tap(session => {
          if (!session || session?.toolId !== toolId) {
            combineLatest([
              this.store.select(selectSessionLoading),
              this.store.select(selectToolLoaded)
            ])
              .pipe(
                take(1),
                tap(([sessionLoading, toolLoaded]) => {
                  if (!sessionLoading && toolLoaded) {
                    if (!session){
                      // If there are no session loaded, dispatch to fetch the latest using
                      this.store.dispatch(fetchLatestSession({ userId: this.userId, toolId }));
                    } else {
                      this.store.dispatch(createSession());
                    }
                  }
                })
              ).subscribe();
          } else if (session) {
            this.session = session;

            this.store.select(selectSessionLoading).pipe(
              take(1),
              tap(loading => {
                if (!loading) {
                  this.store.dispatch(loadSessionResponses({ sessionId: session.id }));
                }
              })
            ).subscribe();
          }
        })
      ).subscribe();
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      console.log('scrolled to bottom');
    } catch (err) {
      console.error('Could not scroll to bottom:', err);
    }
  }

  private scrollToTop(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = 0;
      console.log('scrolled to top');
    } catch (err) {
      console.error('Could not scroll to top:', err);
    }
  }

  sendMessage(message: string): void {
    if (message.trim()) {

      const now = new Date().toISOString();

      // If this is the first message, insert the system prompt into the conversation history
      this.store.pipe(
        select(selectSessionResponses),
        withLatestFrom(this.store.select(selectCurrentSession)),
        filter(([responses, session]) => !!session),
        take(1),
        tap(([responses, session]) => {

          if (responses.length > 0) {
            // Ignore as the system prompt is already in the conversation history
            return responses;
          }

            const systemPrompt: Response = {
              sessionId: session!.id,
              message: session!.systemPrompt,
              userId: null,
              id: "",
              timestamp: now,
              modelName: ""
            };

            this.store.dispatch(addUserMessage({ message: systemPrompt }));

            return;
          })
      ).subscribe();

      const userPrompt: Response = {
        id: "",
        sessionId: this.session!.id,
        message: message,
        userId: this.userId,
        timestamp: new Date(new Date(now).getTime() + 1).toISOString(), // add one millisecond so that it's after the system prompt
        modelName: this.modelName
      };

      this.store.dispatch(addUserMessage({ message: userPrompt }));

      this.store.dispatch(sendPrompt({ sessionId: this.session!.id, message: message, modelName: this.modelName}));

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

  newSession() {
    this.store.dispatch(createSession());
  }
}
