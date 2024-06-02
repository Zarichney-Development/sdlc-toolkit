import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MarkdownModule } from 'ngx-markdown';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { CatalogComponent } from './catalog/catalog.component';
import { ToolComponent } from './tool/tool.component';
import { MessageComponent } from './message/message.component';
import { roleReducer } from './role/role.reducer';
import { RoleEffects } from './role/role.effects';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { toolReducer } from './tool/tool.reducer';
import { ToolEffects } from './tool/tool.effects';
import { UserEffects } from './user/user.effects';
import { categoryReducer } from './category/category.reducer';
import { CategoryEffects } from './category/category.effects';
import { userReducer } from './user/user.reducer';
import { SessionEffects } from './session/session.effects';
import { sessionReducer } from './session/session.reducer';
import { ToolDetailsModalComponent } from './tool/details-modal/tool-details-modal.component';
import { ToolSystemPromptModalComponent } from './tool/system-prompt-modal/tool-system-prompt-modal.component';
import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    AppComponent,
    CatalogComponent,
    ToolComponent,
    MessageComponent,
    ToolDetailsModalComponent,
    ToolSystemPromptModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    StoreModule.forRoot({
      roleState: roleReducer,
      categoryState: categoryReducer,
      toolState: toolReducer,
      userState: userReducer,
      sessionState: sessionReducer
    }),
    EffectsModule.forRoot([RoleEffects, ToolEffects, UserEffects, CategoryEffects, SessionEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
    MarkdownModule.forRoot(),
    LMarkdownEditorModule,
    MatButtonToggleModule,
    MatIconModule,
    MatTooltipModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
