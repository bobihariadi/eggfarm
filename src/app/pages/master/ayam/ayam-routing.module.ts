import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AyamPage } from './ayam.page';

const routes: Routes = [
  {
    path: '',
    component: AyamPage
  },
  {
    path: 'formayam',
    loadChildren: () => import('./formayam/formayam.module').then( m => m.FormayamPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AyamPageRoutingModule {}
