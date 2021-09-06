import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LuarPage } from './luar.page';

const routes: Routes = [
  {
    path: '',
    component: LuarPage
  },
  {
    path: 'formluar',
    loadChildren: () => import('./formluar/formluar.module').then( m => m.FormluarPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LuarPageRoutingModule {}
