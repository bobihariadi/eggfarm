import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonInfiniteScroll } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { conf } from 'src/config';

@Component({
  selector: 'app-pembayaran',
  templateUrl: './pembayaran.page.html',
  styleUrls: ['./pembayaran.page.scss'],
})
export class PembayaranPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  idParam: any;
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
    private router: Router
  ) {}

  async ngOnInit() {
    await this.storageCtrl.create();
    this.storageCtrl.get('dataLogin').then(async (data) => {
      this.jwt = data[0].jwt;

      this.activatedRoute.queryParams.subscribe(async (params) => {
        if (params && params.special) {
          //store the temp in data
          const arrParam = JSON.parse(params.special);
          this.idParam = await arrParam.id;
        }
        await this.getData();
      });
    });
  }

  async getData(event?) {
    this.showList = false;
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

    let where = 'where 1=1 ';
    if (this.idParam) {
      where = where + ' and  a.id_penjualan = ' + this.idParam;
    }

    if (this.searchTerm != '') {
      where = where + " and b.nama_pel like '%" + this.searchTerm + "%'";
    }

    let arrdata = {
      action: 'arraytable',
      select:
        'a.id, a.jml_bayar, a.createBy, b.nama_pel, date_format(a.tgl,"%d-%m-%Y") tgl',
      table: 'tx_pembayaran a left join m_pelanggan b on a.id_pel = b.id_pel',
      limit: 'Limit ' + this.page + ',' + this.limit,
      order: 'order by a.tgl desc, a.id desc, b.nama_pel',
      where: where,
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
    if (this.idParam) {
      where = where + ' and  a.id_penjualan = ' + this.idParam;
    }

    if (this.searchTerm != '') {
      where = where + " and b.nama_pel like '%" + this.searchTerm + "%'";
    }

    let arrData = {
      action: 'arraytable',
      select:
        'a.id, a.jml_bayar, a.createBy, b.nama_pel, date_format(a.tgl,"%d-%m-%Y") tgl',
      table: 'tx_pembayaran a left join m_pelanggan b on a.id_pel = b.id_pel',
      limit: 'Limit ' + this.page + ',' + this.limit,
      order: 'order by a.tgl desc, a.id desc, b.nama_pel',
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
}
