import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompoundListComponent } from './components/compound-list/compound-list.component';
import { CompoundDetailComponent } from './components/compound-detail/compound-detail.component';
import { CompoundEditComponent } from './components/compound-edit/compound-edit.component';
import { LoginComponent } from './auth/login.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/compounds', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'compounds', component: CompoundListComponent },
  { path: 'compounds/gallery', component: CompoundListComponent },
  { path: 'compounds/new', component: CompoundEditComponent, canActivate: [AuthGuard] },
  { path: 'compounds/:id', component: CompoundDetailComponent },
  { path: 'compounds/:id/edit', component: CompoundEditComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/compounds' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 