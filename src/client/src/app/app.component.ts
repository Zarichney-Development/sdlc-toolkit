import { Component } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { AppState } from './app.state';
import { setUserId } from './user/user.actions';
import { selectUser } from './user/user.selectors';
import { loadTools, unloadTool } from './tool/tool.actions';
import { selectCurrentTool } from './tool/tool.selectors';
import { Tool } from './tool/tool.model';
import { ActivatedRoute } from '@angular/router';
import { createSession, fetchLatestSession } from './session/session.actions';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  showUserProfile = false;
  userId = '';
  newUserId = 'userid';
  showToolDetails = false;
  currentTool$: Observable<Tool | null>;

  constructor(
    private route: ActivatedRoute,
    private store: Store<AppState>
  ) {

    this.currentTool$ = this.store.pipe(select(selectCurrentTool));

    this.store.select(selectUser).subscribe(user => {
      this.userId = user.userId;
    });

    this.store.dispatch(loadTools({ role: null, category: null }));

    const toolId = this.route.snapshot.paramMap.get('id');
    if (toolId)
      this.store.dispatch(fetchLatestSession({ userId: this.userId, toolId: parseInt(toolId) }));
    else
      this.store.dispatch(fetchLatestSession({ userId: this.userId, toolId: null }));

  }

  toggleUserProfile(show: boolean, event: Event) {
    event.stopPropagation();
    this.showUserProfile = show;
  }

  updateUserId() {
    this.store.dispatch(setUserId({ userId: this.newUserId }));
    this.showUserProfile = false;
  }

  navigateBack() {
    this.store.dispatch(unloadTool())
  }

  toggleToolDetails() {
    this.showToolDetails = !this.showToolDetails;
  }

  newSession() {
    this.store.dispatch(createSession());
  }
}
