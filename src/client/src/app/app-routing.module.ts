import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CatalogComponent } from './catalog/catalog.component';
import { ToolComponent } from './tool/tool.component';

const routes: Routes = [
  { path: '', component: CatalogComponent },
  { path: 'tool/:id', component: ToolComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
