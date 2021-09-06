import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { format, parseISO } from 'date-fns';
import { conf } from 'src/config';

@Component({
  selector: 'app-penjualan',
  templateUrl: './penjualan.page.html',
  styleUrls: ['./penjualan.page.scss'],
})
export class PenjualanPage implements OnInit {
  tglAwal: any;
  tglAkhir: any;
  jwt: any;
  total: any;
  piutang: any;
  bayar: any;

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
    this.bayar = arrBiaya.dibayar;
    this.piutang = arrBiaya.piutang;
    this.total = Number(this.bayar) + Number(this.piutang);
  }

  async clearTgl(event: any, tipe: string) {
    event.target.disabled = false;
    if (tipe === 'awal') {
      this.tglAwal = null;
    } else {
      this.tglAkhir = null;
    }

    let arrBiaya: any = await this.getData();
    this.bayar = arrBiaya.dibayar;
    this.piutang = arrBiaya.piutang;
    this.total = Number(this.bayar) + Number(this.piutang);
  }

  async refreshData(event) {
    let arrBiaya: any = await this.getData();
    this.bayar = arrBiaya.dibayar;
    this.piutang = arrBiaya.piutang;
    this.total = Number(this.bayar) + Number(this.piutang);
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
          " and (a.tgl BETWEEN date_format('" +
          tglAwal +
          "','%Y%m%d') and DATE_ADD(date_format('" +
          tglAkhir +
          "','%Y%m%d'), INTERVAL 1 DAY)) ";
      } else if (this.tglAwal != null && this.tglAkhir == null) {
        where =
          where + " and a.tgl >= date_format('" + tglAwal + "','%Y%m%d') ";
      } else if (this.tglAwal == null && this.tglAkhir != null) {
        where =
          where +
          " and a.tgl <= DATE_ADD(date_format('" +
          tglAkhir +
          "','%Y%m%d'), INTERVAL 1 DAY) ";
      }

      let arrData = {
        action: 'rowtable',
        select:
          '  sum(ifnull((select sum(jml_bayar) from tx_pembayaran where id_penjualan = a.id ),0)) dibayar, sum((total_harga - ifnull((select sum(jml_bayar) from tx_pembayaran where id_penjualan = a.id ),0))) piutang ',
        table: 'tx_penjualan a',
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
}
