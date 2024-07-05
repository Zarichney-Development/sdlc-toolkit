import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Position, Role } from '../role/role.model';
import { Tool } from '../tool/tool.model';
import { Category, SdlcPhase } from '../category/category.model';
import { loadRoles } from '../role/role.actions';
import { loadCategories } from '../category/category.actions';
import { selectAllRoles, selectRolesLoading, selectRolesError } from '../role/role.selectors';
import { selectAllTools, selectToolsLoading, selectToolsError } from '../tool/tool.selectors';
import { selectAllCategories, selectCategoriesLoading, selectCategoriesError } from '../category/category.selectors';
import { AppState } from '../app.state';
import { loadTool } from '../tool/tool.actions';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  roles$!: Observable<Role[]>;
  tools$!: Observable<Tool[]>;
  categories$!: Observable<Category[]>;
  loadingRoles$!: Observable<boolean>;
  loadingTools$!: Observable<boolean>;
  loadingCategories$!: Observable<boolean>;
  errorRoles$!: Observable<any>;
  errorTools$!: Observable<any>;
  errorCategories$!: Observable<any>;
  selectedRole: Position | null = null;
  selectedCategory: SdlcPhase | null = null;
  allTools: Tool[] = [];

  constructor(private store: Store<AppState>) { }

  ngOnInit(): void {
    this.store.dispatch(loadRoles());
    this.store.dispatch(loadCategories());
    this.roles$ = this.store.pipe(select(selectAllRoles));
    this.loadingRoles$ = this.store.pipe(select(selectRolesLoading));
    this.errorRoles$ = this.store.pipe(select(selectRolesError));
    this.categories$ = this.store.pipe(select(selectAllCategories));
    this.loadingCategories$ = this.store.pipe(select(selectCategoriesLoading));
    this.errorCategories$ = this.store.pipe(select(selectCategoriesError));
    this.store.pipe(select(selectAllTools)).subscribe(tools => this.allTools = tools);
    this.loadingTools$ = this.store.pipe(select(selectToolsLoading));
    this.errorTools$ = this.store.pipe(select(selectToolsError));
  }

  onRoleChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const val = selectElement.value;
    this.selectedRole = val && !val.includes("null") ? parseInt(val, 10) : null;
    console.log('Role changed:', this.selectedRole);
  }

  onCategoryChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const val = selectElement.value;
    this.selectedCategory = val && !val.includes("null") ? parseInt(val, 10) : null;
    console.log('Category changed:', this.selectedCategory);
  }

  filteredTools(categoryId: number): Tool[] {
    return this.allTools.filter(tool =>
      tool.categoryId === categoryId &&
      (this.selectedRole === null || tool.positions.includes(this.selectedRole))
    );
  }

  navigateToTool(toolId: number): void {
    this.store.dispatch(loadTool({ toolId: toolId }));
  }
}
