import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  AlertController,
  LoadingController,
  ModalController,
  NavParams,
  ToastController,
} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { format, parseISO } from 'date-fns';
import { conf } from 'src/config';

@Component({
  selector: 'app-modaljual',
  templateUrl: './modaljual.page.html',
  styleUrls: ['./modaljual.page.scss'],
})
export class ModaljualPage implements OnInit {
  passId: number;
  action: string;
  jwt: any;
  arrList: any;
  arrJenis: any;
  arrPelanggan: any;
  fakeList: Array<any> = new Array(7);
  showList: boolean = false;

  tglJual: any = new Date().toISOString();
  fullName: string;
  role: any;
  arrHarga: any;
  h_tray: number;
  h_telur: number;
  th_tray: number;
  th_telur: number;
  h_total: number;
  pelanggan: number;
  tipe_harga: string;
  jenis_prod: string;

  jmlTray: number;
  jmlTelur: number;

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private storageCtrl: Storage,
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    await this.storageCtrl.create();
    this.passId = this.navParams.get('pass_id');
    this.action = this.navParams.get('action');

    this.storageCtrl.get('dataLogin').then(async (data) => {
      this.jwt = data[0].jwt;
      this.role = data[0].level;
      this.fullName = data[0].full_name;
      this.arrHarga = await this.getHarga();
      this.arrJenis = await this.getJenis();
      this.arrPelanggan = await this.getPelanggan();
      if (this.action == 'Edit') {
        await this.getData();
      } else {
        this.showList = true;
      }
    });
  }

  closeModal() {
    let dataTest = {
      aa: 'aa',
      bb: 'bb',
    };
    this.modalCtrl.dismiss(dataTest);
  }

  async getData() {
    // this.arrBatch = await this.getBatch();
    // this.arrJenis = await this.getJenis();
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

    let where = 'where id =' + this.passId;

    let arrdata = {
      action: 'rowtable',
      select:
        'id, id_pel, jenis_prod, jml_tray,jml_telur, tipe_harga, date_format(tgl, "%Y-%m-%d") as tgl',
      table: 'tx_penjualan',
      limit: '',
      order: '',
      where: where,
    };

    this.http
      .post(conf.api_url_wartek + 'master', arrdata, { headers: headers })
      .subscribe(
        async (data) => {
          this.tglJual = data['tgl'];
          this.passId = data['id'];
          this.pelanggan = data['id_pel'];
          this.jenis_prod = data['jenis_prod'];
          this.tipe_harga = data['tipe_harga'];
          this.jmlTray = data['jml_tray'];
          this.jmlTelur = data['jml_telur'];
          this.showList = true;
          this.changeHarga(this.tipe_harga);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getPelanggan(params = '') {
    return new Promise((resolve) => {
      let headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

      let where = params ? 'and id_pel =' + params : '';

      let arrdata = {
        action: 'arraytable',
        select: 'id_pel, nama_pel',
        table: 'm_pelanggan',
        limit: '',
        order: 'order by nama_pel asc',
        where: "where aktif = 'Y' " + where,
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

  getHarga(params = '') {
    return new Promise((resolve) => {
      let headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

      let where = params ? 'where id =' + params : '';

      let arrdata = {
        action: 'arraytable',
        select: 'id, label_harga, harga, harga_per_telur',
        table: 'm_harga',
        limit: '',
        order: 'order by id asc',
        where: where,
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

  async getJenis() {
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
        where: ' where tr_reff_id = "3" and reff_id != "R"',
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

  async changeHarga(e: any) {
    let val = '';
    // if (this.action == 'Edit') {
    //   val = e;
    // } else {
    //   val = e.target.value;
    // }

    if (e.target) {
      val = e.target.value;
    } else {
      val = e;
    }

    let arrHarga = await this.getHarga(val);
    this.h_tray = arrHarga[0].harga;
    this.h_telur = arrHarga[0].harga_per_telur;
    this.hitungTotalHarga();
  }

  async hitungTotalHarga() {
    this.th_tray = (await (this.jmlTray ?? 0)) * (this.h_tray ?? 0);
    this.th_telur = (await (this.jmlTelur ?? 0)) * (this.h_telur ?? 0);
    this.h_total = this.th_tray + this.th_telur;
  }

  customActionSheetOptions: any = {
    header: 'Daftar Pelanggan',
  };

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
    const loading = await this.loadingCtrl.create({
      cssClass: 'my-custom-class',
      message: 'Mohon menunggu...',
    });
    await loading.present();

    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

    let arrdata = {
      action: this.action,
      table: 'tx_penjualan',
      data: {
        id_pel: this.pelanggan,
        tgl: format(parseISO(this.tglJual), 'yyyyMMdd'),
        jml_tray: this.jmlTray,
        jml_telur: this.jmlTelur,
        harga: this.h_tray,
        harga_per_telur: this.h_telur,
        total_harga: this.h_total,
        total: (this.jmlTray ?? 0) * Number(30) + Number(this.jmlTelur ?? 0),
        tipe_harga: this.tipe_harga,
        jenis_prod: this.jenis_prod,
        status_bayar: 'B',
        createBy: this.fullName,
      },
      except: '',
      where: { id: this.passId },
    };
    this.http
      .post(conf.api_url_wartek + 'postdata', arrdata, { headers: headers })
      .subscribe(
        (data) => {
          loading.dismiss();
          this.showTost('Berhasil simpan data');
          this.closeModal();
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
