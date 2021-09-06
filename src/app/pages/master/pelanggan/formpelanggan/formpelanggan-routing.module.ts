import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormpelangganPage } from './formpelanggan.page';

const routes: Routes = [
  {
    path: '',
    component: FormpelangganPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormpelangganPageRoutingModule {}
