import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JualPage } from './jual.page';

const routes: Routes = [
  {
    path: '',
    component: JualPage
  },
  {
    path: 'modaljual',
    loadChildren: () => import('./modaljual/modaljual.module').then( m => m.ModaljualPageModule)
  },
  {
    path: 'formbayar',
    loadChildren: () => import('./formbayar/formbayar.module').then( m => m.FormbayarPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JualPageRoutingModule {}
