import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ActionSheetController,
  AlertController,
  Platform,
  PopoverController,
} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { PopoverComponent } from 'src/app/components/popover/popover.component';
import { conf } from 'src/config';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  totalTray: number = 0;
  totalTrayJual: number = 0;
  isAdministrator: boolean = false;
  role: any;
  fullName: string;
  jwt: any;
  expired: boolean = false;
  backButtonPressedOnceToExit: boolean = false;
  subscription: any;

  constructor(
    private storageCtrl: Storage,
    private router: Router,
    private popoverCtrl: PopoverController,
    private http: HttpClient,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private platform: Platform
  ) {}

  async ngOnInit() {
    await this.storageCtrl.create();
    this.storageCtrl.get('isLogin').then((val) => {
      if (!val) {
        this.router.navigate(['login'], { replaceUrl: true });
      }
    });

    this.storageCtrl.get('dataLogin').then(async (data) => {
      this.fullName = data[0].full_name;
      this.role = data[0].level;
      this.jwt = await data[0].jwt;

      await this.cekExpired(this.jwt);

      if (this.role == '1') {
        this.isAdministrator = true;
      }
      this.getTotalTray();
    });
  }

  cekExpired(jwt: any) {
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    let arrData = {
      token: jwt,
    };

    this.http
      .post(conf.api_cek_sesi + 'decode', arrData, { headers: headers })
      .subscribe(
        async (data: any) => {
          // console.log('now : ' + Date.now() + '\nexp : ' + data.exp * 1000);
          if (Date.now() >= data.exp * 1000) {
            const alert = await this.alertCtrl.create({
              cssClass: 'my-custom-class',
              header: 'Pemberitahuan!',
              message: 'Session anda telah berakhir, silahkan login kembali!',
              buttons: [
                {
                  text: 'Ya',
                  handler: () => {
                    this.storageCtrl.clear();
                    this.router.navigate(['login'], { replaceUrl: true });
                  },
                },
              ],
            });

            await alert.present();
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  async onClick() {
    this.storageCtrl.clear();
    this.router.navigate(['login'], { replaceUrl: true });
  }

  goTo(param) {
    this.router.navigateByUrl(param);
  }

  async btnPopover(ev: any) {
    let popover = await this.popoverCtrl.create({
      component: PopoverComponent,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true,
    });
    await popover.present();
  }

  getTotalTray() {
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

    let where = " where  tgl_prod = date_format(now(),'%Y%m%d') ";

    let arrdata = {
      action: 'rowtable',
      select: 'sum(jml_tray) total',
      table: 'tx_produksi',
      limit: '',
      order: '',
      where: where,
    };

    this.http
      .post(conf.api_url_wartek + 'master', arrdata, { headers: headers })
      .subscribe(
        async (data) => {
          this.totalTray = data['total'] ?? 0;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getTotalTrayTerjual() {
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

    let where = " where  tgl = date_format(now(),'%Y%m%d') ";

    let arrdata = {
      action: 'rowtable',
      select: 'sum(jml_tray) total',
      table: 'tx_penjualan',
      limit: '',
      order: '',
      where: where,
    };

    this.http
      .post(conf.api_url_wartek + 'master', arrdata, { headers: headers })
      .subscribe(
        async (data) => {
          this.totalTrayJual = data['total'] ?? 0;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  async showMenu() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Menu Master',
      cssClass: 'my-custom-class',
      buttons: [
        {
          text: 'Harga',
          icon: 'logo-usd',
          handler: () => {
            this.router.navigateByUrl('harga');
          },
        },
        {
          text: 'Pelanggan',
          icon: 'people-outline',
          handler: () => {
            this.router.navigateByUrl('pelanggan');
          },
        },
        {
          text: 'Ayam',
          icon: 'egg-outline',
          handler: () => {
            this.router.navigateByUrl('ayam');
          },
        },
      ],
    });
    await actionSheet.present();
  }

  async refreshData(event) {
    await this.getTotalTray();
    this.getTotalTrayTerjual();
    event.target.complete();
  }

  ionViewDidEnter() {
    this.subscription = this.platform.backButton.subscribe(() => {
      if (this.backButtonPressedOnceToExit) {
        navigator['app'].exitApp();
      } else {
        // setTimeout(() => {
        //   this.backButtonPressedOnceToExit = false;
        // }, 1500);
        this.backButtonPressedOnceToExit = true;
      }
    });
  }

  ionViewWillLeave() {
    this.subscription.unsubscribe();
  }
}
