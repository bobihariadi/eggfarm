import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { IonInfiniteScroll } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Chart, registerables } from 'chart.js';
import { conf } from 'src/config';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.page.html',
  styleUrls: ['./chart.page.scss'],
})
export class ChartPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild('lineVancasMingguan') private lineVancasMingguan: ElementRef;
  @ViewChild('doughnutCanvas') private doughnutCanvas: ElementRef;
  @ViewChild('lineCanvas') private lineCanvas: ElementRef;

  lineChartMingguan: Chart;
  doughnutChart: Chart;
  lineChart: Chart;
  canvasElement: any;

  arrVal: any;
  arrValMingguan: any;

  jwt: any;

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private http: HttpClient,
    private storageCtrl: Storage
  ) {
    Chart.register(...registerables);
  }

  async ngOnInit() {
    await this.storageCtrl.create();
    this.storageCtrl.get('dataLogin').then(async (data) => {
      this.jwt = await data[0].jwt;
      this.arrVal = await this.getData();
      this.arrValMingguan = await this.getDataMingguan();
      await this.lineChartFC();
      await this.lineChartMingguanFC();
    });
    // setTimeout(async () => {
    //   // await this.barChartMethod();
    //   // await this.doughnutChartMethod();
    // }, 1500);
  }

  async refreshData(event) {
    this.arrVal = await this.getData();
    this.arrValMingguan = await this.getDataMingguan();

    event.target.complete();
    if (this.lineChart) {
      this.lineChart.destroy();
      this.canvasElement = this.lineCanvas.nativeElement;
      this.renderer.setAttribute(this.canvasElement, 'height', '317px');
    }

    if (this.lineChartMingguan) {
      this.lineChartMingguan.destroy();
      this.canvasElement = this.lineVancasMingguan.nativeElement;
      this.renderer.setAttribute(this.canvasElement, 'height', '317px');
    }

    await this.lineChartFC();
    await this.lineChartMingguanFC();
  }

  getData() {
    return new Promise((resolve) => {
      var headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

      let where =
        ' where tgl_prod between date_sub(now(), INTERVAL 10 day)  and now() group by tgl_prod';

      let arrData = {
        action: 'arraytable',
        select:
          'sum(case when jenis_prod = "B" then jml_tray else 0 end) as trayBagus, sum(case when jenis_prod = "P" then jml_tray else 0 end) as trayPecah, sum(case when jenis_prod = "R" then jml_tray else 0 end) as trayRusak, date_format(tgl_prod,"%d-%b") tgl',
        table: 'tx_produksi',
        limit: '',
        order: ' order by tgl_prod',
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

  getDataMingguan() {
    return new Promise((resolve) => {
      var headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      headers = headers.append('Authorization', 'Bearer ' + this.jwt); //bearer

      let where =
        " where date_format(tgl_prod,'%m') BETWEEN MONTH(CURRENT_DATE - INTERVAL 1 MONTH) and date_format(now(),'%m') group by yearweek(tgl_prod)";

      let arrData = {
        action: 'arraytable',
        select:
          'sum(case when jenis_prod = "B" then jml_tray else 0 end) as trayBagus, sum(case when jenis_prod = "P" then jml_tray else 0 end) as trayPecah, sum(case when jenis_prod = "R" then jml_tray else 0 end) as trayRusak, concat(date_format(str_to_date(concat(yearweek(tgl_prod), " monday"), "%X%V %W"),"%b")," | ",WEEK(tgl_prod)) as tgl',
        table: 'tx_produksi',
        limit: '',
        order: ' order by tgl_prod',
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

  async lineChartFC() {
    if (this.lineChart) {
      this.lineChart.destroy();
      // this.canvasElement = this.lineCanvas.nativeElement;
      // this.renderer.setAttribute(this.canvasElement, 'height', '317px');
    }

    let arrLabels: string[] = [];
    let arrValBagus: number[] = [];
    let arrValPecah: number[] = [];
    let arrValRusak: number[] = [];

    this.arrVal.forEach((el) => {
      arrLabels.push(el.tgl);
      arrValBagus.push(Number(el.trayBagus));
      arrValPecah.push(Number(el.trayPecah));
      arrValRusak.push(Number(el.trayRusak));
    });

    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: arrLabels,
        datasets: [
          {
            label: 'Bagus',
            data: arrValBagus,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
          {
            label: 'Pecah',
            data: arrValPecah,
            fill: false,
            borderColor: 'rgb(162, 0, 255)',
            tension: 0.1,
          },
          {
            label: 'Rusak',
            data: arrValRusak,
            fill: false,
            borderColor: 'rgb(209, 13, 7)',
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Produksi Telur (Tray)',
          },
        },
      },
    });
  }

  async lineChartMingguanFC() {
    if (this.lineChartMingguan) {
      this.lineChartMingguan.destroy();
      // this.canvasElement = this.lineCanvas.nativeElement;
      // this.renderer.setAttribute(this.canvasElement, 'height', '317px');
    }

    let arrLabels: string[] = [];
    let arrValBagus: number[] = [];
    let arrValPecah: number[] = [];
    let arrValRusak: number[] = [];

    this.arrValMingguan.forEach((el) => {
      arrLabels.push(el.tgl);
      arrValBagus.push(Number(el.trayBagus));
      arrValPecah.push(Number(el.trayPecah));
      arrValRusak.push(Number(el.trayRusak));
    });

    this.lineChartMingguan = new Chart(this.lineVancasMingguan.nativeElement, {
      type: 'line',
      data: {
        labels: arrLabels,
        datasets: [
          {
            label: 'Bagus',
            data: arrValBagus,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
          {
            label: 'Pecah',
            data: arrValPecah,
            fill: false,
            borderColor: 'rgb(162, 0, 255)',
            tension: 0.1,
          },
          {
            label: 'Rusak',
            data: arrValRusak,
            fill: false,
            borderColor: 'rgb(209, 13, 7)',
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Produksi Telur (Tray)',
          },
        },
      },
    });
  }

  // barChartMethod() {
  //   if (this.barChart) this.barChart.destroy();

  //   this.barChart = new Chart(this.barCanvas.nativeElement, {
  //     type: 'bar',
  //     data: {
  //       labels: ['BJP', 'INC', 'AAP', 'CPI', 'CPI-M', 'NCP'],
  //       datasets: [
  //         {
  //           label: '# of Votes',
  //           data: [200, 50, 30, 15, 20, 34],
  //           backgroundColor: [
  //             'rgba(255, 99, 132, 0.2)',
  //             'rgba(54, 162, 235, 0.2)',
  //             'rgba(255, 206, 86, 0.2)',
  //             'rgba(75, 192, 192, 0.2)',
  //             'rgba(153, 102, 255, 0.2)',
  //             'rgba(255, 159, 64, 0.2)',
  //           ],
  //           borderColor: [
  //             'rgba(255,99,132,1)',
  //             'rgba(54, 162, 235, 1)',
  //             'rgba(255, 206, 86, 1)',
  //             'rgba(75, 192, 192, 1)',
  //             'rgba(153, 102, 255, 1)',
  //             'rgba(255, 159, 64, 1)',
  //           ],
  //           borderWidth: 1,
  //         },
  //       ],
  //     },
  //     options: {
  //       scales: {
  //         y: {
  //           beginAtZero: true,
  //         },
  //       },
  //     },
  //   });
  // }

  doughnutChartMethod() {
    if (this.doughnutChart) this.doughnutChart.destroy();

    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['BJP', 'Congress', 'AAP', 'CPM', 'SP'],
        datasets: [
          {
            label: '# of Votes',
            data: [50, 29, 15, 10, 7],
            backgroundColor: [
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
            ],
            hoverBackgroundColor: [
              '#FFCE56',
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#FF6384',
            ],
          },
        ],
      },
    });
  }

  async onClick() {
    this.router.navigate(['home'], { replaceUrl: true });
  }
}
