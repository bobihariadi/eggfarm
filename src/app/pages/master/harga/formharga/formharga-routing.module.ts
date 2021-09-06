import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormhargaPage } from './formharga.page';

const routes: Routes = [
  {
    path: '',
    component: FormhargaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormhargaPageRoutingModule {}
