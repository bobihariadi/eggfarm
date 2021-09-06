import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AyamPageRoutingModule } from './ayam-routing.module';

import { AyamPage } from './ayam.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AyamPageRoutingModule
  ],
  declarations: [AyamPage]
})
export class AyamPageModule {}
