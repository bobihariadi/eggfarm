import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FormhargaPageRoutingModule } from './formharga-routing.module';

import { FormhargaPage } from './formharga.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormhargaPageRoutingModule
  ],
  declarations: [FormhargaPage]
})
export class FormhargaPageModule {}
