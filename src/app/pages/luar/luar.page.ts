import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  IonInfiniteScroll,
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { conf } from 'src/config';
import { FormluarPage } from './formluar/formluar.page';

@Component({
  selector: 'app-luar',
  templateUrl: './luar.page.html',
  styleUrls: ['./luar.page.scss'],
})
export class LuarPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  jwt: any;
  arrData: any = [];
  fakeList: Array<any> = new Array(5);
  showList: boolean = false;
  searchTerm: string = '';
  arrList: any = [];

  page: number = 0;
  limit: number = 20;
  totalRow: number = 0;
  constructor(
    private activatedRoute: ActivatedRoute,
    private storageCtrl: Storage,
    private http: HttpClient,
    private router: Router,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.storageCtrl.create();
    this.storageCtrl.get('dataLogin').then(async (data) => {
      this.jwt = await data[0].jwt;
      await this.getData();
    });
  }

  async getData(event?) {
    this.showList = false;
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

    let where = 'where 1=1 ';

    if (this.searchTerm != '') {
      where = where + " and keterangan like '%" + this.searchTerm + "%'";
    }

    let arrData = {
      action: 'arraytable',
      select:
        'id, biaya, keterangan, createBy, date_format(tgl,"%d %M %Y") tgl',
      table: 'tx_pengeluaran',
      limit: 'Limit ' + this.page + ',' + this.limit,
      order: 'order by tgl desc, createDate desc',
      where: where,
    };

    this.http
      .post(conf.api_url_wartek + 'master', arrData, { headers: headers })
      .subscribe(
        (data) => {
          this.showList = true;
          this.arrList = data;
          if (event) {
            event.target.complete();
          }

          if (!this.arrList.length) {
            this.arrList = [];
          } else {
            // this.infiniteScroll.disabled = false;
            this.totalRow = data[0].total_row;
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  async refreshData(event) {
    this.infiniteScroll.disabled = false;
    this.page = 0;
    this.showList = false;
    this.searchTerm = '';
    event.target.disabled = false;
    this.getData(event);
    event.target.disabled = false;
  }

  // start serach
  setFilteredItems(ev: any) {
    const val = ev.target.value;
    this.searchTerm = val;
    this.page = 0;
    this.getData();
  }

  cleared(ev: any) {
    const val = ev.target.value;
    this.searchTerm = val;
    this.page = 0;
    this.getData();
  }
  // end seaarch

  // start load more data
  async loadData(event) {
    this.page = this.page + this.limit;
    await this.moreData(event);
    if (this.page >= this.totalRow) {
      event.target.disabled = true;
    }
  }

  moreData(event?) {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

    let where = 'where 1=1 ';
    if (this.searchTerm != '') {
      where = where + " and keterangan like '%" + this.searchTerm + "%'";
    }

    let arrData = {
      action: 'arraytable',
      select:
        'id, biaya, keterangan, createBy, date_format(tgl,"%d %M %Y") tgl',
      table: 'tx_pengeluaran',
      limit: 'Limit ' + this.page + ',' + this.limit,
      order: 'order by tgl desc',
      where: where,
    };

    this.http
      .post(conf.api_url_wartek + 'master', arrData, { headers: headers })
      .subscribe(
        (data) => {
          let count: number = 0;
          event.target.complete();
          this.arrData = data;
          this.arrData.forEach((element) => {
            count += 1;
            this.arrList.push(element);
          });
          if (count === 0) {
            this.infiniteScroll.disabled = true;
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  async presentModal(pId, pAct) {
    const modal = await this.modalCtrl.create({
      component: FormluarPage,
      cssClass: 'my-custom-class',
      componentProps: {
        pass_id: pId,
        action: pAct,
      },
    });

    modal.onDidDismiss().then((r) => {
      this.page = 0;
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
      table: 'tx_pengeluaran',
      data: '',
      except: '',
      where: { id: val },
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
}
