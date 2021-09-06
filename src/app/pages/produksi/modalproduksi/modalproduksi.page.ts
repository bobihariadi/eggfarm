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
  selector: 'app-modalproduksi',
  templateUrl: './modalproduksi.page.html',
  styleUrls: ['./modalproduksi.page.scss'],
})
export class ModalproduksiPage implements OnInit {
  passId: number;
  action: string;
  jwt: any;
  arrList: any;
  arrJenis: any;
  fakeList: Array<any> = new Array(7);
  showList: boolean = false;

  tglProd: any = new Date().toISOString();
  arrBatch: any;
  totalTelur: number;
  jmlTray: number;
  jmlTelur: number;
  jenis_prod: any;
  batch: string;
  keterangan: string;
  fullName: string;

  isactive: string = 'Y';
  branch_id: number = 1;
  role: any;
  isdisabled: any = true;
  listActive: any[] = [
    {
      val: 'Y',
      valdesc: 'Ya',
    },
    {
      val: 'T',
      valdesc: 'Tidak',
    },
  ];

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
      if (this.action == 'Edit') {
        console.log(this.tglProd);
        await this.getData();
      } else {
        this.arrBatch = await this.getBatch();
        this.arrJenis = await this.getJenis();
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
        where: ' where tr_reff_id = "3" ',
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

  async getBatch() {
    return new Promise((resolve) => {
      let headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

      let arrdata = {
        action: 'arraytable',
        select: 'batch_no',
        table: 'm_ayam',
        limit: '',
        order: '',
        where: '',
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

  hitungTotalTelur() {
    this.totalTelur =
      (this.jmlTray ?? 0) * Number(30) + Number(this.jmlTelur ?? 0);
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
    if (
      this.totalTelur === 0 ||
      this.jenis_prod == null ||
      this.batch == null ||
      this.tglProd == null
    ) {
      this.showTost('Data tidak lengkap');
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
      action: this.action,
      table: 'tx_produksi',
      data: {
        batch_no: this.batch,
        jml_tray: this.jmlTray,
        jml_telur: this.jmlTelur,
        total: this.totalTelur,
        tgl_prod: format(parseISO(this.tglProd), 'yyyyMMdd'),
        jenis_prod: this.jenis_prod,
        keterangan: this.keterangan,
        createBy: this.fullName,
      },
      except: '',
      where: { id: this.passId },
    };
    this.http
      .post(conf.api_url_wartek + 'postdata', arrdata, { headers: headers })
      .subscribe(
        (data) => {
          console.log(data);
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

  async getData() {
    this.arrBatch = await this.getBatch();
    this.arrJenis = await this.getJenis();
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

    let where = 'where id =' + this.passId;

    let arrdata = {
      action: 'rowtable',
      select:
        'id, batch_no, jenis_prod, jml_tray,jml_telur,total,keterangan, date_format(tgl_prod, "%Y-%m-%d") as tgl',
      table: 'tx_produksi',
      limit: '',
      order: '',
      where: where,
    };

    this.http
      .post(conf.api_url_wartek + 'master', arrdata, { headers: headers })
      .subscribe(
        async (data) => {
          this.tglProd = data['tgl'];
          this.passId = data['id'];
          this.batch = data['batch_no'];
          this.jenis_prod = data['jenis_prod'];
          this.jmlTray = data['jml_tray'];
          this.jmlTelur = data['jml_telur'];
          this.totalTelur = data['total'];
          this.keterangan = data['keterangan'];
          this.showList = true;
        },
        (error) => {
          console.log(error);
        }
      );
  }
}
