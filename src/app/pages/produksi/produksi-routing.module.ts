import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProduksiPage } from './produksi.page';

const routes: Routes = [
  {
    path: '',
    component: ProduksiPage
  },
  {
    path: 'modalproduksi',
    loadChildren: () => import('./modalproduksi/modalproduksi.module').then( m => m.ModalproduksiPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProduksiPageRoutingModule {}
