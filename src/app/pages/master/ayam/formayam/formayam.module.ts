import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FormayamPageRoutingModule } from './formayam-routing.module';

import { FormayamPage } from './formayam.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormayamPageRoutingModule
  ],
  declarations: [FormayamPage]
})
export class FormayamPageModule {}
