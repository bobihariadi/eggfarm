import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormluarPage } from './formluar.page';

const routes: Routes = [
  {
    path: '',
    component: FormluarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormluarPageRoutingModule {}
