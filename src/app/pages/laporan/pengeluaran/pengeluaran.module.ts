import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PengeluaranPageRoutingModule } from './pengeluaran-routing.module';

import { PengeluaranPage } from './pengeluaran.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PengeluaranPageRoutingModule
  ],
  declarations: [PengeluaranPage]
})
export class PengeluaranPageModule {}
