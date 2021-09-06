import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProduksiPageRoutingModule } from './produksi-routing.module';

import { ProduksiPage } from './produksi.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProduksiPageRoutingModule
  ],
  declarations: [ProduksiPage]
})
export class ProduksiPageModule {}
