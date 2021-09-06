import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ResolveEnd, Router } from '@angular/router';
import {
  AlertController,
  LoadingController,
  NavParams,
  ToastController,
} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { format, parseISO } from 'date-fns';
import { conf } from 'src/config';

@Component({
  selector: 'app-formbayar',
  templateUrl: './formbayar.page.html',
  styleUrls: ['./formbayar.page.scss'],
})
export class FormbayarPage implements OnInit {
  idParam: any;
  jwt: any;
  arrData: any = [];
  fullName: string;
  role: any;
  tglJual: any;

  tgl: any = new Date().toISOString();
  nama_pel: any;
  total_harga: number;
  id_pel: any;
  total_bayar: any;
  statusBayar: string;
  totalBayar: any;
  sisaBayar: number;

  DECIMAL_SEPARATOR = '.';
  GROUP_SEPARATOR = ',';

  constructor(
    private activatedRoute: ActivatedRoute,
    private storageCtrl: Storage,
    private http: HttpClient,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.storageCtrl.create();
    this.storageCtrl.get('dataLogin').then(async (data) => {
      this.jwt = data[0].jwt;
      this.role = data[0].level;
      this.fullName = data[0].full_name;

      this.activatedRoute.queryParams.subscribe(async (params) => {
        if (params && params.special) {
          //store the temp in data
          const arrParam = JSON.parse(params.special);
          this.idParam = await arrParam.id;
          this.arrData = await this.getData();
          this.tglJual = this.arrData[0].tgl;
          this.nama_pel = this.arrData[0].nama_pel;
          this.total_harga = this.arrData[0].total_harga;
          this.id_pel = this.arrData[0].id_pel;

          this.totalBayar = await this.getTotalBayar();
          this.sisaBayar = await (Number(this.total_harga) -
            Number(this.totalBayar.bayar));
        }
      });
    });
  }

  async getData() {
    return new Promise((resolve) => {
      let headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

      let arrdata = {
        action: 'arraytable',
        select:
          'a.id, a.id_pel, a.total_harga, b.nama_pel, date_format(a.tgl,"%d-%m-%Y") tgl',
        table: 'tx_penjualan a left join m_pelanggan b on a.id_pel = b.id_pel',
        limit: '',
        order: '',
        where: ' where a.id = ' + this.idParam,
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

  async saveForm() {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Pemberitahuan!',
      message: 'Simpan data ini?',
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
            this.saveFormCommit();
          },
        },
      ],
    });

    await alert.present();
  }

  async saveFormCommit() {
    let angka = this.total_bayar.replaceAll(',', '');

    if (this.total_bayar === 0 || this.total_bayar == null) {
      this.showTost('Total bayar harus diisi');
      return false;
    }

    const loading = await this.loadingCtrl.create({
      cssClass: 'my-custom-class',
      message: 'Mohon menunggu...',
    });
    await loading.present();

    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

    let arrdata = {
      action: 'Add',
      table: 'tx_pembayaran',
      data: {
        id_pel: this.id_pel,
        tgl: format(parseISO(this.tgl), 'yyyyMMdd'),
        id_penjualan: this.idParam,
        jml_bayar: angka,
        createBy: this.fullName,
      },
      except: '',
      where: '',
    };
    this.http
      .post(conf.api_url_wartek + 'postdata', arrdata, { headers: headers })
      .subscribe(
        async (data) => {
          loading.dismiss();
          this.showTost('Berhasil simpan data');
          await this.cekStatus();
          setTimeout(() => {
            // this.router
            //   .navigateByUrl('/jual', { skipLocationChange: true })
            //   .then(() => {
            //     this.router.navigate(['jual']);
            //   });
            this.router.navigateByUrl('jual');
          }, 1000);
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

  async cekStatus() {
    let angka = this.total_bayar.replaceAll(',', '');

    let totBayar = Number(this.totalBayar.bayar) + Number(angka);

    if (totBayar < Number(this.total_harga)) {
      this.statusBayar = 'S';
    } else {
      this.statusBayar = 'L';
    }

    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

    let arrdata = {
      action: 'Edit',
      table: 'tx_penjualan',
      data: {
        status_bayar: this.statusBayar,
      },
      except: '',
      where: { id: this.idParam },
    };
    this.http
      .post(conf.api_url_wartek + 'postdata', arrdata, { headers: headers })
      .subscribe(
        async (data) => {
          console.log(data);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  async getTotalBayar() {
    return new Promise((resolve) => {
      let headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

      let arrdata = {
        action: 'rowtable',
        select: 'sum(jml_bayar) bayar',
        table: 'tx_pembayaran ',
        limit: '',
        order: '',
        where: ' where id_penjualan = ' + this.idParam,
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

  getSisaBayar(e: any) {
    let angka = e.target.value.replaceAll(',', '');
    // let newangka = parseInt(angka, 10);

    let totBayar =
      Number(this.total_harga) -
      Number(this.totalBayar.bayar || 0) -
      Number(Math.max(0, angka) || 0);
    this.sisaBayar = Math.max(0, totBayar);

    this.total_bayar = this.format(e.target.value);
  }

  format(valString) {
    if (!valString) {
      return '';
    }
    let val = valString.toString();
    const parts = this.unFormat(val).split(this.DECIMAL_SEPARATOR);
    return (
      parts[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, this.GROUP_SEPARATOR) +
      (!parts[1] ? '' : this.DECIMAL_SEPARATOR + parts[1])
    );
  }

  unFormat(val) {
    if (!val) {
      return '';
    }
    val = val.replace(/^0+/, '');

    if (this.GROUP_SEPARATOR === ',') {
      return val.replace(/,/g, '');
    } else {
      return val.replace(/\./g, '');
    }
  }
}
