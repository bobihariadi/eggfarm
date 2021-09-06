import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FormbayarPageRoutingModule } from './formbayar-routing.module';

import { FormbayarPage } from './formbayar.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormbayarPageRoutingModule
  ],
  declarations: [FormbayarPage]
})
export class FormbayarPageModule {}
