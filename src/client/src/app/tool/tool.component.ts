import { Component, ElementRef, HostListener, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Store, select } from '@ngrx/store';
import {
  Observable,
  distinctUntilChanged,
  filter,
  map,
  take,
  tap,
  withLatestFrom,
  Subject,
  takeUntil,
  delay,
  switchMap,
  skip,
  combineLatestWith,
  debounceTime
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
import { selectCurrentTool, selectToolLoaded, selectToolsLoading } from './tool.selectors';
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
export class ToolComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild(MarkdownEditorComponent) editor!: MarkdownEditorComponent;
  @ViewChild('relatedToolsContent') relatedToolsContent!: ElementRef;

  tool!: Tool;
  userId!: string;
  session!: Session;
  responses$: Observable<Response[]>;
  message: string = '';
  modelName: string = 'gpt40'; // Default to "Quality"
  loading: boolean = true;
  systemPromptShow: boolean = false;
  systemPromptOpen: boolean = false;
  showRelatedTools = false;
  sessionCreationInProgress = false;
  subscription: any;
  $first: any;
  destroy$ = new Subject<void>();

  editorOptions: MdEditorOption = {
    showPreviewPanel: false,
    showBorder: true,
    hideIcons: ['Link', 'Image'],
    usingFontAwesome5: true,
    scrollPastEnd: 0,
    enablePreviewContentClick: true,
    resizable: false,
    placeholder: 'Enter your markdown content here...',
    markedjsOpt: {
      breaks: true,
      gfm: true,
      tables: true,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: false
    },
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
    private router: Router,
    private store: Store<AppState>
  ) {
    this.responses$ = this.initializeResponses();
  }

  ngOnInit(): void {
    this.initializeComponent();
    this.handleRouteChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    this.initializeTool();
    this.initializeUser();
    this.initializeSession();

    // Scroll to bottom upon initial load
    this.responses$.pipe(
      filter(responses => responses.length > 0),
      take(1),
      delay(10),
      tap(() => this.scrollToBottom())
    ).subscribe()
  }

  private handleRouteChanges(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      tap(() => {
        this.initializeComponent();
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private initializeResponses(): Observable<Response[]> {
    return this.store.pipe(
      select(selectSessionResponses),
      withLatestFrom(this.store.select(selectCurrentSession)),
      filter(([_, session]) => !!session),
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
      tap(() => { this.loading = false; }),
      takeUntil(this.destroy$)
    );
  }

  private initializeTool(): void {
    const toolId = +this.route.snapshot.paramMap.get('id')!;
    this.store.select(selectCurrentTool).pipe(
      combineLatestWith([
        this.store.select(selectToolsLoading),
        this.store.select(selectToolLoaded)
      ]),
      distinctUntilChanged(),
      tap(([tool, loading, loaded = false]) => {
        if (!loading && !loaded) {
          this.store.dispatch(loadTool({ toolId }));
        }
      }),
      filter(([tool]) => !!tool),
      take(1),
      tap(([tool]) => {
        this.tool = tool!;
        this.updateEditorPlaceholder(tool!);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private initializeUser(): void {
    this.store.pipe(
      select(selectUser),
      take(1),
      tap(user => this.userId = user.userId),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private initializeSession(): void {
    this.store.select(selectToolLoaded).pipe(
      filter(loaded => loaded === true),
      switchMap(() => this.store.select(selectCurrentTool)),
      distinctUntilChanged(),
      switchMap(tool =>
        this.store.select(selectCurrentSession).pipe(
          withLatestFrom(
            this.store.select(selectSessionLoading),
            this.store.select(selectToolLoaded)
          )
        )
      ),
      debounceTime(300), // Add debounce to prevent rapid firing
      tap(([session, sessionLoading, toolLoaded]) => {
        if (!this.sessionCreationInProgress && (!session || session?.toolId !== this.tool.id)) {
          if (!sessionLoading && toolLoaded) {
            this.sessionCreationInProgress = true;
            if (!session) {
              this.store.dispatch(fetchLatestSession({ userId: this.userId, toolId: this.tool.id }));
            } else {
              this.store.dispatch(createSession());
            }
          }
        } else if (session) {
          this.sessionCreationInProgress = false;
          this.session = session;
          this.loadConversation(session.id);
        }
      }),
      takeUntil(this.destroy$)
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

  private updateEditorPlaceholder(tool: Tool): void {
    this.editorOptions = {
      ...this.editorOptions,
      placeholder: "Input: " + tool.expectedInput
    };
  }

  sendMessage(message: string): void {
    if (message.trim()) {
      const now = new Date().toISOString();

      this.insertSystemPromptIfNeeded(now);

      const userPrompt: Response = {
        id: "",
        sessionId: this.session!.id,
        message: message,
        userId: this.userId,
        timestamp: new Date(new Date(now).getTime() + 1).toISOString(), // add one millisecond so that it's after the system prompt
        modelName: this.modelName
      };

      this.store.dispatch(addUserMessage({ message: userPrompt }));
      this.store.dispatch(sendPrompt({ sessionId: this.session!.id, message: message, modelName: this.modelName }));

      this.handleResponseLoading();

      this.message = '';
    }
  }

  private insertSystemPromptIfNeeded(now: string): void {
    this.store.pipe(
      select(selectSessionResponses),
      withLatestFrom(this.store.select(selectCurrentSession)),
      filter(([responses, session]) => !!session && responses.length === 0),
      take(1),
      tap(([_, session]) => {
        const systemPrompt: Response = {
          sessionId: session!.id,
          message: session!.systemPrompt,
          userId: null,
          id: "",
          timestamp: now,
          modelName: ""
        };
        this.store.dispatch(addUserMessage({ message: systemPrompt }));
      })
    ).subscribe();
  }

  private loadConversation(sessionId: string): void {
    this.store.dispatch(loadSessionResponses({ sessionId }));
  }

  private handleResponseLoading(): void {
    this.loading = true;
    this.store.pipe(
      select(selectSessionResponses),
      skip(1), // this is the user's submitted message
      take(1), // this is the prompt response
      tap(() => this.loading = false)
    ).subscribe();
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
    if (!this.sessionCreationInProgress) {
      this.sessionCreationInProgress = true;
      this.store.dispatch(createSession());

      // Wait for the new session to be created and then load its conversation
      this.store.select(selectCurrentSession).pipe(
        filter(session => !!session && session.id !== this.session?.id),
        take(1),
        tap(newSession => {
          this.session = newSession!;
          this.loadConversation(this.session.id);
          this.sessionCreationInProgress = false;
        })
      ).subscribe();
    }
  }

  toggleRelatedTools(event: MouseEvent) {
    this.showRelatedTools = !this.showRelatedTools;
    if (this.showRelatedTools) {
      setTimeout(() => this.positionRelatedToolsContent(event), 0);
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.showRelatedTools) {
      this.positionRelatedToolsContent();
    }
  }

  positionRelatedToolsContent(event?: MouseEvent) {
    const content = this.relatedToolsContent.nativeElement;
    const button = event ? event.target as HTMLElement : content.previousElementSibling;
    const rect = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < content.offsetHeight && spaceAbove > spaceBelow) {
      content.style.bottom = `${button.offsetHeight}px`;
      content.style.top = 'auto';
    } else {
      content.style.top = `${button.offsetHeight}px`;
      content.style.bottom = 'auto';
    }

    // Adjust horizontal position if necessary
    const rightEdge = rect.left + content.offsetWidth;
    if (rightEdge > window.innerWidth) {
      content.style.right = '0';
      content.style.left = 'auto';
    } else {
      content.style.left = '0';
      content.style.right = 'auto';
    }
  }

  loadRelatedTool(toolId: number) {
    this.store.dispatch(loadTool({ toolId }));
    this.showRelatedTools = false;

    // Navigate to the new tool route
    this.router.navigate(['/tool', toolId]);
  }

  getValues(obj: { [key: string]: number }): number[] {
    return Object.values(obj).map(Number);
  }
}