import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalproduksiPage } from './modalproduksi.page';

const routes: Routes = [
  {
    path: '',
    component: ModalproduksiPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalproduksiPageRoutingModule {}
