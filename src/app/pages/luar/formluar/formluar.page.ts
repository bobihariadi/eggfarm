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
  selector: 'app-formluar',
  templateUrl: './formluar.page.html',
  styleUrls: ['./formluar.page.scss'],
})
export class FormluarPage implements OnInit {
  passId: number;
  action: string;
  jwt: any;
  fakeList: Array<any> = new Array(4);
  showList: boolean = false;
  fullName: string;
  role: any;

  tgl: any = new Date().toISOString();
  biaya: any;
  keterangan: string;

  DECIMAL_SEPARATOR = '.';
  GROUP_SEPARATOR = ',';

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
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

    let where = 'where id =' + this.passId;

    let arrdata = {
      action: 'rowtable',
      select: '',
      table: 'tx_pengeluaran',
      limit: '',
      order: '',
      where: where,
    };

    this.http
      .post(conf.api_url_wartek + 'master', arrdata, { headers: headers })
      .subscribe(
        async (data) => {
          this.tgl = data['tgl'];
          this.passId = data['id'];
          this.biaya = data['biaya'];
          this.keterangan = data['keterangan'];
          this.showList = true;
        },
        (error) => {
          console.log(error);
        }
      );
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
    let biaya = this.biaya.replaceAll(',', '');

    if (
      this.keterangan == null ||
      this.keterangan == '' ||
      Number(biaya) == null ||
      Number(biaya) <= 0
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
      table: 'tx_pengeluaran',
      data: {
        biaya: biaya,
        keterangan: this.keterangan,
        tgl: format(parseISO(this.tgl), 'yyyyMMdd'),
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

  getFormat(e: any) {
    this.biaya = this.format(e.target.value);
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
