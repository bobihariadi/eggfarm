import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  LoadingController,
  PopoverController,
} from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit {
  constructor(
    private router: Router,
    private popoverCtrl: PopoverController,
    private storageCtrl: Storage,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  async ngOnInit() {
    await this.storageCtrl.create();
  }

  async logOut() {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Pemberitahuan!',
      message: 'Yakin untuk <strong>keluar</strong>!!!',
      buttons: [
        {
          text: 'Tidak',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {},
        },
        {
          text: 'Ya',
          handler: async () => {
            await this.actLogout();
          },
        },
      ],
    });

    await alert.present();
  }

  async actLogout() {
    await this.storageCtrl.create();
    const loading = await this.loadingCtrl.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
    });
    await loading.present();
    this.storageCtrl.clear();
    loading.dismiss();
    this.router.navigate(['login'], { replaceUrl: true });
  }

  async DismissClick() {
    await this.popoverCtrl.dismiss();
  }
}
