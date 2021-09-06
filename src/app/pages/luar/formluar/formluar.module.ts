import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FormluarPageRoutingModule } from './formluar-routing.module';

import { FormluarPage } from './formluar.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormluarPageRoutingModule
  ],
  declarations: [FormluarPage]
})
export class FormluarPageModule {}
