import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  IonInfiniteScroll,
  IonSearchbar,
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { format, parseISO } from 'date-fns';
import { timer } from 'rxjs';
import { conf } from 'src/config';
import { ModalproduksiPage } from './modalproduksi/modalproduksi.page';

@Component({
  selector: 'app-produksi',
  templateUrl: './produksi.page.html',
  styleUrls: ['./produksi.page.scss'],
})
export class ProduksiPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild(IonSearchbar, { read: ElementRef }) searchbar: IonSearchbar;
  @ViewChild(IonSearchbar) searchBarNew: IonSearchbar;

  fakeList: Array<any> = new Array(7);
  showList: boolean = false;
  arrList: any = [];
  subscription: any;
  arrData: any = [];
  searchTerm: string = '';
  page: number = 0;
  limit: number = 20;
  totalRow: number = 0;
  jwt: any;
  isAdministrator: boolean = false;
  branch_id: any;
  role: any;
  isSearchbarOpened: boolean = false;
  tglProd: any;

  constructor(
    private router: Router,
    private http: HttpClient,
    private storageCtrl: Storage,
    private modalCtrl: ModalController,
    private renderer: Renderer2,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.storageCtrl.create();
    this.storageCtrl.get('dataLogin').then((data) => {
      this.jwt = data[0].jwt;
      this.role = data[0].level;
      if (this.role == '1') {
        this.isAdministrator = true;
      }
      this.getData();
    });
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

  setFilteredItems(ev: any) {
    const val = ev.target.value;
    this.searchTerm = val;
    this.page = 0;
    this.getData();
  }

  async getData(event?) {
    // this.arrCabang = await this.getCabang();
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer
    let where = 'where 1=1 ';

    if (this.searchTerm != '') {
      where = where + " and b.name like '%" + this.searchTerm + "%'";
    }

    if (this.tglProd != null && this.tglProd != '') {
      let startDate = format(parseISO(this.tglProd), 'yyyyMMdd');

      where =
        where + " and a.tgl_prod = date_format('" + startDate + "','%Y%m%d') ";
    }

    let arrData = {
      action: 'arraytable',
      select:
        'a.id, a.batch_no, a.jml_tray, a.jml_telur, a.total, a.jenis_prod, b.name as jenis_prod_ur, date_format(a.tgl_prod, "%d-%m-%Y") tgl_prod, a.keterangan, a.createBy',
      table:
        "tx_produksi a left join tm_reff b on a.jenis_prod = b.reff_id and b.tr_reff_id = '3' ",
      limit: 'Limit ' + this.page + ',' + this.limit,
      order: 'order by a.tgl_prod desc',
      where: where,
    };

    this.http
      .post(conf.api_url_wartek + 'master', arrData, { headers: headers })
      .subscribe(
        (data) => {
          this.arrList = data;
          if (event) {
            event.target.complete();
          }
          this.showList = true;

          if (!this.arrList.length) {
            this.arrList = [];
          } else {
            this.infiniteScroll.disabled = false;
            this.totalRow = data[0].total_row;
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  cleared(ev: any) {
    const val = ev.target.value;
    this.searchTerm = val;
    this.page = 0;
    this.getData();
  }

  async loadData(event) {
    this.page = this.page + this.limit;
    await this.moreData(event);
    if (this.page >= this.totalRow) {
      event.target.disabled = true;
    }
  }

  moreData(event?) {
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

    let where = 'where 1=1 ';

    if (this.searchTerm != '') {
      where = where + " and b.name like '%" + this.searchTerm + "%'";
    }

    if (this.tglProd != null && this.tglProd != '') {
      let startDate = format(parseISO(this.tglProd), 'yyyyMMdd');

      where =
        where + " and a.tgl_prod = date_format('" + startDate + "','%Y%m%d') ";
    }

    let arrData = {
      action: 'arraytable',
      select:
        'a.id, a.batch_no, a.jml_tray, a.jml_telur, a.total, a.jenis_prod, b.name as jenis_prod_ur, date_format(a.tgl_prod, "%d-%m-%Y") tgl_prod, a.keterangan, a.createBy',
      table:
        "tx_produksi a left join tm_reff b on a.jenis_prod = b.reff_id and b.tr_reff_id = '3' ",
      limit: 'Limit ' + this.page + ',' + this.limit,
      order: 'order by a.tgl_prod desc',
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
            this.arrList.push(element);
            count += 1;
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
      component: ModalproduksiPage,
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

  setIsSearchbarOpened(e) {
    this.isSearchbarOpened = true;
    this.renderer.setStyle(
      this.searchbar['nativeElement'],
      'margin-left',
      '10px'
    );
    this.renderer.setStyle(this.searchbar['nativeElement'], 'opacity', '1');
    setTimeout(() => {
      this.searchBarNew.setFocus();
    }, 100);
  }

  setIsSearchbarClosed() {
    this.renderer.setStyle(this.searchbar['nativeElement'], 'opacity', '0');
    this.renderer.setStyle(
      this.searchbar['nativeElement'],
      'margin-left',
      '300px'
    );
    this.isSearchbarOpened = false;
  }

  blurFC(ev: any) {
    const val = ev.target.value;
    if (!val) {
      this.isSearchbarOpened = false;
      this.renderer.setStyle(this.searchbar['nativeElement'], 'opacity', '0');
      this.renderer.setStyle(
        this.searchbar['nativeElement'],
        'margin-left',
        '300px'
      );
    }
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
      table: 'tx_produksi',
      data: '',
      except: '',
      where: { id: val },
    };

    this.http
      .post(conf.api_url_wartek + 'postdata', arrdata, { headers: headers })
      .subscribe(
        (data) => {
          this.page = 0;
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

  clearTgl(event) {
    event.target.disabled = false;
    this.tglProd = null;
    this.page = 0;
    this.getData();
  }

  getDataChange(e: any) {
    this.page = 0;
    this.tglProd = e.target.value;
    this.getData();
  }
}
