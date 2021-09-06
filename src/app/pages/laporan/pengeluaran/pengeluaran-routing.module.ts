import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PengeluaranPage } from './pengeluaran.page';

const routes: Routes = [
  {
    path: '',
    component: PengeluaranPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PengeluaranPageRoutingModule {}
