import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PelangganPage } from './pelanggan.page';

const routes: Routes = [
  {
    path: '',
    component: PelangganPage
  },
  {
    path: 'formpelanggan',
    loadChildren: () => import('./formpelanggan/formpelanggan.module').then( m => m.FormpelangganPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PelangganPageRoutingModule {}
