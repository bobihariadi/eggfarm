import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AlertController,
  IonInfiniteScroll,
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { conf } from 'src/config';
import { FormpelangganPage } from './formpelanggan/formpelanggan.page';

@Component({
  selector: 'app-pelanggan',
  templateUrl: './pelanggan.page.html',
  styleUrls: ['./pelanggan.page.scss'],
})
export class PelangganPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  jwt: any;
  arrData: any = [];
  fakeList: Array<any> = new Array(5);
  showList: boolean = false;
  arrList: any = [];

  constructor(
    private storageCtrl: Storage,
    private http: HttpClient,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  async ngOnInit() {
    await this.storageCtrl.create();
    this.storageCtrl.get('dataLogin').then(async (data) => {
      this.jwt = data[0].jwt;
      await this.getData();
    });
  }

  async getData(event?) {
    this.showList = false;
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

    let arrdata = {
      action: 'arraytable',
      select: 'a.*, b.name ur_status',
      table:
        'm_pelanggan a left join tm_reff b on b.reff_id = a.aktif and tr_reff_id=1 ',
      limit: '',
      order: 'order by a.nama_pel',
      where: '',
    };

    this.http
      .post(conf.api_url_wartek + 'master', arrdata, { headers: headers })
      .subscribe(
        (data) => {
          this.showList = true;
          this.arrList = data;
          if (event) {
            event.target.complete();
          }

          if (!this.arrList.length) {
            this.arrList = [];
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  async presentModal(pId, pAct) {
    const modal = await this.modalCtrl.create({
      component: FormpelangganPage,
      cssClass: 'my-custom-class',
      componentProps: {
        pass_id: pId,
        action: pAct,
      },
    });

    modal.onDidDismiss().then((r) => {
      this.getData();
    });
    return await modal.present();
  }

  async delItem(val: any) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Pemberitahuan!',
      message: 'Hapus data ini?',
      buttons: [
        {
          text: 'Tidak',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {},
        },
        {
          text: 'Ya',
          handler: () => {
            this.submitDelItem(val);
          },
        },
      ],
    });

    await alert.present();
  }

  async submitDelItem(val: any) {
    const loading = await this.loadingCtrl.create({
      cssClass: 'my-custom-class',
      message: 'Mohon menunggu...',
    });
    await loading.present();

    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

    let arrdata = {
      action: 'Del',
      table: 'm_pelanggan',
      data: '',
      except: '',
      where: { id_pel: val },
    };

    this.http
      .post(conf.api_url_wartek + 'postdata', arrdata, { headers: headers })
      .subscribe(
        (data) => {
          this.getData();
          loading.dismiss();
          this.showTost('Berhasil dihapus');
        },
        (error) => {
          loading.dismiss();
          this.showTost('Gagal');
          console.log(error);
        }
      );
  }

  async showTost(param) {
    let toast = await this.toastCtrl.create({
      message: param,
      duration: 1000,
      position: 'bottom',
    });
    toast.present();
  }

  async refreshData(event) {
    this.showList = false;
    event.target.disabled = false;
    this.getData(event);
    event.target.disabled = false;
  }
}
