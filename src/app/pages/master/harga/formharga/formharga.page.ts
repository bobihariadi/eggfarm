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
import { conf } from 'src/config';

@Component({
  selector: 'app-formharga',
  templateUrl: './formharga.page.html',
  styleUrls: ['./formharga.page.scss'],
})
export class FormhargaPage implements OnInit {
  passId: number;
  action: string;
  jwt: any;
  fakeList: Array<any> = new Array(3);
  showList: boolean = false;
  fullName: string;

  labelHarga: string;
  hargaTray: any;
  hargaTelur: any;

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
      table: 'm_harga',
      limit: '',
      order: '',
      where: where,
    };

    this.http
      .post(conf.api_url_wartek + 'master', arrdata, { headers: headers })
      .subscribe(
        async (data) => {
          this.labelHarga = data['label_harga'];
          this.passId = data['id'];
          this.hargaTray = data['harga'];
          this.hargaTelur = data['harga_per_telur'];
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
    let tray = this.hargaTray.replaceAll(',', '');
    let telur = this.hargaTelur.replaceAll(',', '');

    if (
      this.labelHarga == null ||
      this.labelHarga == '' ||
      Number(tray) == null ||
      Number(tray) <= 0 ||
      Number(telur) == null ||
      Number(telur) <= 0
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
      table: 'm_harga',
      data: {
        label_harga: this.labelHarga,
        harga: tray,
        harga_per_telur: telur,
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

  getFormat(e: any, t: string) {
    if (t === 'tray') {
      this.hargaTray = this.format(e.target.value);
    } else {
      this.hargaTelur = this.format(e.target.value);
    }

    // let angka = e.target.value.replaceAll(',', '');
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
