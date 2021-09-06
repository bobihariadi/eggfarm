import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormbayarPage } from './formbayar.page';

const routes: Routes = [
  {
    path: '',
    component: FormbayarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormbayarPageRoutingModule {}
