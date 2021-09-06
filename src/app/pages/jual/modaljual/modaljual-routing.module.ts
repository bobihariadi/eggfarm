import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModaljualPage } from './modaljual.page';

const routes: Routes = [
  {
    path: '',
    component: ModaljualPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModaljualPageRoutingModule {}
