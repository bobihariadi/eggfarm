import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PenjualanPage } from './penjualan.page';

const routes: Routes = [
  {
    path: '',
    component: PenjualanPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PenjualanPageRoutingModule {}
