import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HargaPage } from './harga.page';

const routes: Routes = [
  {
    path: '',
    component: HargaPage,
  },
  {
    path: 'formharga',
    loadChildren: () =>
      import('./formharga/formharga.module').then((m) => m.FormhargaPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HargaPageRoutingModule {}
