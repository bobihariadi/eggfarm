import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormayamPage } from './formayam.page';

const routes: Routes = [
  {
    path: '',
    component: FormayamPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormayamPageRoutingModule {}
