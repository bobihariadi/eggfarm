import { PengeluaranPageModule } from './../pengeluaran/pengeluaran.module';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'chart',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../chart/chart.module').then((m) => m.ChartPageModule),
          },
        ],
      },
      {
        path: 'penjualan',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../penjualan/penjualan.module').then(
                (m) => m.PenjualanPageModule
              ),
          },
        ],
      },
      {
        path: 'pengeluaran',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../pengeluaran/pengeluaran.module').then(
                (m) => m.PengeluaranPageModule
              ),
          },
        ],
      },
    ],
  },
  {
    path: '',
    redirectTo: 'tabs/chart',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
