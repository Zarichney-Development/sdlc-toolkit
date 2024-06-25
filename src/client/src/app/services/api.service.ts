import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Position, Role } from '../role/role.model';
import { Tool } from '../tool/tool.model';
import { Category, SdlcPhase } from '../category/category.model';
import { Response } from '../message/message.model';
import { Session } from '../session/session.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://localhost:7068/api';

  constructor(private http: HttpClient) { }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/role`);
  }

  getTools(role: Position | null, category: SdlcPhase | null): Observable<Tool[]> {
    let queryParams = '';
    if (role !== null) {
      queryParams += `role=${role}`;
    }
    if (category !== null) {
      queryParams += `category=${category}`;
    }
    let url = `${this.apiUrl}/tool`;
    if (queryParams.length > 0) {
      url += `?${queryParams}`;
    }
    return this.http.get<Tool[]>(url);
  }

  getTool(toolId: number): Observable<Tool> {
    return this.http.get<Tool>(`${this.apiUrl}/tool/${toolId}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/category`);
  }

  createSession(userId: string, toolId: number): Observable<Session> {
    return this.http.post<Session>(`${this.apiUrl}/session`, { userId, toolId });
  }

  updateSession(sessionId: string, systemPrompt: string): Observable<null> {
    return this.http.patch<null>(`${this.apiUrl}/session/${sessionId}`, { systemPrompt });
  }

  getSessionResponses(sessionId: string): Observable<Response[]> {
    return this.http.get<Response[]>(`${this.apiUrl}/session/${sessionId}`);
  }

  sendPrompt(sessionId: string, message: string, modelName: string | undefined): Observable<Response> {
    return this.http.post<Response>(`${this.apiUrl}/prompt`, { sessionId, message, modelName });
  }

  getLatestSession(userId: string, toolId: number | null): Observable<Session> {
    let url = `${this.apiUrl}/session?userId=${userId}`;
    if (toolId !== null) {
      url += `&toolId=${toolId}`;
    }
    return this.http.get<Session>(url);
  }
}
