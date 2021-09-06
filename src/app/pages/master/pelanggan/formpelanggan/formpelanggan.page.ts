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
  selector: 'app-formpelanggan',
  templateUrl: './formpelanggan.page.html',
  styleUrls: ['./formpelanggan.page.scss'],
})
export class FormpelangganPage implements OnInit {
  passId: number;
  action: string;
  jwt: any;
  fakeList: Array<any> = new Array(4);
  showList: boolean = false;
  fullName: string;
  role: any;

  namaPel: string;
  namaToko: string;
  nomorHp: string;
  alamatPel: string;
  aktif: string = 'Y';
  listActive: any[] = [
    {
      val: 'Y',
      valdesc: 'Ya',
    },
    {
      val: 'N',
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

    let where = 'where id_pel =' + this.passId;

    let arrdata = {
      action: 'rowtable',
      select: '',
      table: 'm_pelanggan',
      limit: '',
      order: '',
      where: where,
    };

    this.http
      .post(conf.api_url_wartek + 'master', arrdata, { headers: headers })
      .subscribe(
        async (data) => {
          this.namaPel = data['nama_pel'];
          this.passId = data['id_pel'];
          this.namaToko = data['toko_pel'];
          this.nomorHp = data['hp_pel'];
          this.alamatPel = data['alamat_pel'];
          this.aktif = data['aktif'];
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
    if (
      this.namaPel == null ||
      this.namaPel == '' ||
      this.namaToko == null ||
      this.namaToko == ''
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
      table: 'm_pelanggan',
      data: {
        nama_pel: this.namaPel,
        toko_pel: this.namaToko,
        hp_pel: this.nomorHp,
        alamat_pel: this.alamatPel,
        aktif: this.aktif,
      },
      except: '',
      where: { id_pel: this.passId },
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
