import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { format, parseISO } from 'date-fns';
import { conf } from 'src/config';
import { ModaljualPage } from './modaljual/modaljual.page';
// import { createGesture } from '@ionic/core';

@Component({
  selector: 'app-jual',
  templateUrl: './jual.page.html',
  styleUrls: ['./jual.page.scss'],
})
export class JualPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  lastOnStart: number = 0;
  DOUBLE_CLICK_THRESHOLD: number = 500;

  fakeList: Array<any> = new Array(3);
  showList: boolean = false;
  arrList: any = [];
  arrData: any = [];
  arrStatus: any = [];
  searchTerm: string = '';
  jwt: any;
  isAdministrator: boolean = false;
  role: any;
  page: number = 0;
  limit: number = 20;
  totalRow: number = 0;
  tglJual: any;
  status: any;

  constructor(
    private http: HttpClient,
    private storageCtrl: Storage,
    private modalCtrl: ModalController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.storageCtrl.create();
    this.storageCtrl.get('dataLogin').then(async (data) => {
      this.jwt = data[0].jwt;
      this.role = data[0].level;
      if (this.role == '1') {
        this.isAdministrator = true;
      }
      this.arrStatus = await this.getStatus();
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

  async getData(event?) {
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer
    let where = 'where 1=1 ';

    if (this.searchTerm != '') {
      where = where + " and b.nama_pel like '%" + this.searchTerm + "%'";
    }

    if (this.tglJual != null && this.tglJual != '') {
      let startDate = format(parseISO(this.tglJual), 'yyyyMMdd');

      where = where + " and a.tgl = date_format('" + startDate + "','%Y%m%d') ";
    }

    if (this.status != null && this.status != '') {
      where = where + " and a.status_bayar = '" + this.status + "' ";
    }

    let arrData = {
      action: 'arraytable',
      select:
        'a.id, date_format(a.tgl,"%d-%m-%Y") tgl, b.nama_pel, a.jml_tray, a.jml_telur, a.total, a.harga, a.createBy, a.harga_per_telur, a.total_harga, c.name ur_status, a.status_bayar, e.label_harga, (select sum(jml_bayar) bayar from tx_pembayaran where id_penjualan = a.id ) total_bayar, d.name jenis_prod ',
      table:
        'tx_penjualan a left join m_pelanggan b on a.id_pel = b.id_pel left join tm_reff c on c.reff_id = a.status_bayar and c.tr_reff_id="4" left join tm_reff d on d.reff_id = a.jenis_prod and  d.tr_reff_id = "3" left join m_harga e on e.id=a.tipe_harga ',
      limit: 'Limit ' + this.page + ',' + this.limit,
      order: 'order by a.tgl desc, a.id desc',
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
            // this.infiniteScroll.disabled = false;
            this.totalRow = data[0].total_row;
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  setFilteredItems(ev: any) {
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
      where = where + " and b.nama_pel like '%" + this.searchTerm + "%'";
    }

    if (this.tglJual != null && this.tglJual != '') {
      let startDate = format(parseISO(this.tglJual), 'yyyyMMdd');

      where = where + " and a.tgl = date_format('" + startDate + "','%Y%m%d') ";
    }

    let arrData = {
      action: 'arraytable',
      select:
        'a.id, date_format(a.tgl,"%d-%m-%Y") tgl, b.nama_pel, a.jml_tray, a.jml_telur, a.total, a.harga, a.total_harga, a.createBy, c.name ur_status, a.status_bayar, (select sum(jml_bayar) bayar from tx_pembayaran where id_penjualan = a.id ) total_bayar, d.name jenis_prod ',
      table:
        'tx_penjualan a left join m_pelanggan b on a.id_pel = b.id_pel left join tm_reff c on c.reff_id = a.status_bayar and c.tr_reff_id="4" left join tm_reff d on d.reff_id = a.jenis_prod and  d.tr_reff_id = "3" ',
      limit: 'Limit ' + this.page + ',' + this.limit,
      order: 'order by a.tgl desc, a.id desc',
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

  clearTgl(event) {
    event.target.disabled = false;
    this.tglJual = null;
    this.page = 0;
    this.getData();
  }

  clearStatus(event) {
    event.target.disabled = false;
    this.status = null;
    this.page = 0;
    this.getData();
  }

  getDataChange(e: any) {
    this.page = 0;
    this.tglJual = e.target.value;
    this.getData();
  }

  getStatusChange(e: any) {
    this.page = 0;
    this.status = e.target.value;
    this.getData();
  }

  cleared(ev: any) {
    const val = ev.target.value;
    this.searchTerm = val;
    this.page = 0;
    this.getData();
  }

  async presentModal(pId, pAct) {
    const modal = await this.modalCtrl.create({
      component: ModaljualPage,
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

  async getStatus() {
    return new Promise((resolve) => {
      let headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

      let arrdata = {
        action: 'arraytable',
        select: 'reff_id, name',
        table: 'tm_reff',
        limit: '',
        order: 'order by _order asc',
        where: ' where tr_reff_id = "4"',
      };

      this.http
        .post(conf.api_url_wartek + 'master', arrdata, { headers: headers })
        .subscribe(
          (data) => {
            resolve(data);
          },
          (error) => {
            console.log(error);
          }
        );
    });
  }

  actBayar(idParam, statParam) {
    if (statParam !== 'L') {
      let param = {
        id: idParam,
      };
      let navigationExtras: NavigationExtras = {
        queryParams: {
          special: JSON.stringify(param),
        },
      };

      this.router.navigate(['jual/formbayar'], navigationExtras);
    }
  }

  getPembayaran(idParam) {
    let param = {
      id: idParam,
    };
    let navigationExtras: NavigationExtras = {
      queryParams: {
        special: JSON.stringify(param),
      },
    };

    this.router.navigate(['pembayaran'], navigationExtras);
  }
}
