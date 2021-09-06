import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { format, parseISO } from 'date-fns';
import { conf } from 'src/config';

@Component({
  selector: 'app-pengeluaran',
  templateUrl: './pengeluaran.page.html',
  styleUrls: ['./pengeluaran.page.scss'],
})
export class PengeluaranPage implements OnInit {
  tglAwal: any;
  tglAkhir: any;
  jwt: any;
  total: any;
  arrList: any = [];

  page: number = 0;
  limit: number = 20;

  constructor(
    private router: Router,
    private http: HttpClient,
    private storageCtrl: Storage
  ) {}

  async ngOnInit() {
    await this.storageCtrl.create();
    this.storageCtrl.get('dataLogin').then(async (data) => {
      this.jwt = await data[0].jwt;
    });
  }

  async onClick() {
    this.router.navigate(['home'], { replaceUrl: true });
  }

  async getDataChange(event: any, tipe: string) {
    if (tipe === 'awal') {
      this.tglAwal = format(parseISO(event.target.value), 'yyyyMMdd');
    } else {
      this.tglAkhir = format(parseISO(event.target.value), 'yyyyMMdd');
    }

    let arrBiaya: any = await this.getData();
    this.total = arrBiaya.biaya;
    this.getListData();
  }

  async clearTgl(event: any, tipe: string) {
    event.target.disabled = false;
    if (tipe === 'awal') {
      this.tglAwal = null;
    } else {
      this.tglAkhir = null;
    }

    let arrBiaya: any = await this.getData();
    this.total = arrBiaya.biaya;
    this.getListData();
  }

  async refreshData(event) {
    let arrBiaya: any = await this.getData();
    this.total = arrBiaya.biaya;
    await this.getListData();
    event.target.complete();
  }

  getData() {
    return new Promise((resolve) => {
      var headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

      let where = ' where 1=1 ';
      let tglAwal = this.tglAwal;
      let tglAkhir = this.tglAkhir;

      if (this.tglAwal != null && this.tglAkhir != null) {
        where =
          where +
          " and (tgl BETWEEN date_format('" +
          tglAwal +
          "','%Y%m%d') and DATE_ADD(date_format('" +
          tglAkhir +
          "','%Y%m%d'), INTERVAL 1 DAY)) ";
      } else if (this.tglAwal != null && this.tglAkhir == null) {
        where = where + " and tgl >= date_format('" + tglAwal + "','%Y%m%d') ";
      } else if (this.tglAwal == null && this.tglAkhir != null) {
        where =
          where +
          " and tgl <= DATE_ADD(date_format('" +
          tglAkhir +
          "','%Y%m%d'), INTERVAL 1 DAY) ";
      }

      let arrData = {
        action: 'rowtable',
        select: 'sum(biaya) biaya',
        table: 'tx_pengeluaran',
        limit: '',
        order: '',
        where: where,
      };

      this.http
        .post(conf.api_url_wartek + 'master', arrData, { headers: headers })
        .subscribe(
          async (data) => {
            // this.arrVal = data;
            resolve(data);
          },
          (error) => {
            console.log(error);
          }
        );
    });
  }

  async getListData(event?) {
    // this.showList = false;
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

    let where = ' where 1=1 ';
    let tglAwal = this.tglAwal;
    let tglAkhir = this.tglAkhir;

    if (this.tglAwal != null && this.tglAkhir != null) {
      where =
        where +
        " and (tgl BETWEEN date_format('" +
        tglAwal +
        "','%Y%m%d') and DATE_ADD(date_format('" +
        tglAkhir +
        "','%Y%m%d'), INTERVAL 1 DAY)) ";
    } else if (this.tglAwal != null && this.tglAkhir == null) {
      where = where + " and tgl >= date_format('" + tglAwal + "','%Y%m%d') ";
    } else if (this.tglAwal == null && this.tglAkhir != null) {
      where =
        where +
        " and tgl <= DATE_ADD(date_format('" +
        tglAkhir +
        "','%Y%m%d'), INTERVAL 1 DAY) ";
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
          // this.showList = true;
          this.arrList = data;
          if (event) {
            event.target.complete();
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }
}
