import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalproduksiPageRoutingModule } from './modalproduksi-routing.module';

import { ModalproduksiPage } from './modalproduksi.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalproduksiPageRoutingModule
  ],
  declarations: [ModalproduksiPage]
})
export class ModalproduksiPageModule {}
