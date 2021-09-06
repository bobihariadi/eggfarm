import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PenjualanPageRoutingModule } from './penjualan-routing.module';

import { PenjualanPage } from './penjualan.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PenjualanPageRoutingModule
  ],
  declarations: [PenjualanPage]
})
export class PenjualanPageModule {}
