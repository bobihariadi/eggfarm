import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LuarPageRoutingModule } from './luar-routing.module';

import { LuarPage } from './luar.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LuarPageRoutingModule
  ],
  declarations: [LuarPage]
})
export class LuarPageModule {}
