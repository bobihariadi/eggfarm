import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FormpelangganPageRoutingModule } from './formpelanggan-routing.module';

import { FormpelangganPage } from './formpelanggan.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormpelangganPageRoutingModule
  ],
  declarations: [FormpelangganPage]
})
export class FormpelangganPageModule {}
