import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModaljualPageRoutingModule } from './modaljual-routing.module';

import { ModaljualPage } from './modaljual.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModaljualPageRoutingModule
  ],
  declarations: [ModaljualPage]
})
export class ModaljualPageModule {}
