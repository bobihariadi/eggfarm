import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./pages/home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'chart',
    loadChildren: () =>
      import('./pages/laporan/chart/chart.module').then(
        (m) => m.ChartPageModule
      ),
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./pages/laporan/tabs/tabs.module').then((m) => m.TabsPageModule),
  },
  {
    path: 'penjualan',
    loadChildren: () =>
      import('./pages/laporan/penjualan/penjualan.module').then(
        (m) => m.PenjualanPageModule
      ),
  },
  {
    path: 'produksi',
    loadChildren: () =>
      import('./pages/produksi/produksi.module').then(
        (m) => m.ProduksiPageModule
      ),
  },
  {
    path: 'pembayaran',
    loadChildren: () =>
      import('./pages/pembayaran/pembayaran.module').then(
        (m) => m.PembayaranPageModule
      ),
  },
  {
    path: 'jual',
    loadChildren: () =>
      import('./pages/jual/jual.module').then((m) => m.JualPageModule),
  },
  {
    path: 'pelanggan',
    loadChildren: () =>
      import('./pages/master/pelanggan/pelanggan.module').then(
        (m) => m.PelangganPageModule
      ),
  },
  {
    path: 'harga',
    loadChildren: () =>
      import('./pages/master/harga/harga.module').then(
        (m) => m.HargaPageModule
      ),
  },
  {
    path: 'ayam',
    loadChildren: () =>
      import('./pages/master/ayam/ayam.module').then((m) => m.AyamPageModule),
  },
  {
    path: 'pengeluaran',
    loadChildren: () =>
      import('./pages/laporan/pengeluaran/pengeluaran.module').then(
        (m) => m.PengeluaranPageModule
      ),
  },
  {
    path: 'luar',
    loadChildren: () =>
      import('./pages/luar/luar.module').then((m) => m.LuarPageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
