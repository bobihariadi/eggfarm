import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PelangganPageRoutingModule } from './pelanggan-routing.module';

import { PelangganPage } from './pelanggan.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PelangganPageRoutingModule
  ],
  declarations: [PelangganPage]
})
export class PelangganPageModule {}
