import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HargaPageRoutingModule } from './harga-routing.module';

import { HargaPage } from './harga.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HargaPageRoutingModule
  ],
  declarations: [HargaPage]
})
export class HargaPageModule {}
