import { Component, OnInit, ViewChild } from '@angular/core';
import candela from 'candela';
import 'candela/plugins/vega/load.js';
import * as d3 from 'd3';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-distribution',
  templateUrl: './distribution.component.html',
  styleUrls: ['./distribution.component.css']
})
export class DistributionComponent implements OnInit {

  public csvData: string;

  @ViewChild('csvReader') csvReader: any;
  private categorias: any = []; // Para guardar las categorias o la coordenada x
  private values: any = []; // Para guardar los valroes de las serie7
  private values3d: any = [];

  private svg: any;

  constructor(private http: HttpClient) {
    this.http.get('assets/alimentos.csv', { responseType: 'text' })
      .subscribe(
        data => {
          this.csvData = data;
          this.allGraphs();

        },
        error => {
          console.log(error);
        }

      );
  }

  ngOnInit(): void {


  }

  private allGraphs() {

    let text = [];

    let seriesName = "";  // Para guardar el nombre de la serie
    let myheader = [];  // Las cabeceras que interesan el fichero csv

    let csvRecordsArray = (<String>this.csvData).split(/\r\n|\n/);

    let headersRow = this.getHeaderArray(csvRecordsArray);

    //Saca el nombre de la serie que vamos a representar
    seriesName = headersRow[27].trim().replace(/['"]+/g, '');

    //Cargamos los datos que se van a representar en las gráficas
    this.getDataRecordsArrayFromCSVFile(csvRecordsArray);

    const el = document.getElementById('grafica');

    var vis = new candela.components.Histogram(el, {
      data: this.values,
      x: 'Intervalos sobre porcentajes de obesidad',
      width: window.innerWidth / 2,
      height: 400
    });
    vis.render();

    //---------------------------------------------------------------------------------------------------------

    var myValues = [];
    for (let i = 0; i < this.values3d.length; i++) {
      myValues.push(this.values3d[i].obesity);
    }

    var bin1 = d3.bin();
    var mybuc = bin1(myValues);

    var margin = { top: 50, right: 30, bottom: 50, left: 60 },
      width = window.innerWidth / 2 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    var max = (Math.trunc(d3.max(myValues) / 0.02) + 1) * 0.02;
    var min = d3.min(myValues);

    this.svg = d3.select("#histogram3d")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    var aux = Math.trunc((max / 5) + 1) * 5;


    var x = d3.scaleLinear()
      .domain([min, aux])
      .range([0, width]);

    // Draw the X-axis on the DOM
    this.svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x));

    var y = d3.scaleLinear()
      .domain([0, max])
      .range([height, 0]);

    this.svg.append('g')
      .call(d3.axisLeft(y)
        .tickSizeInner(-width))
      .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke", "grey"));

    this.svg.selectAll("rect")
      .data(mybuc)
      .enter()
      .append("rect")
      .attr("x", 1)
      .attr("transform", function (d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
      .attr("width", function (d) { return x(d.x1) - x(d.x0) - 1; })
      .attr("height", function (d) { return height - y(d.length); })
      .style("fill", "#007fbf");

    //Añadiendo título al gráfico
    this.svg.append("text")
      .attr("font-family", "Arial, Helvetica, sans-serif")
      .style("font-size", "12px")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text("Distribution - d3");

    //Añadiendo título al eje Y
    this.svg.append("text")
      .attr("font-family", "Arial, Helvetica, sans-serif")
      .style("font-size", "12px")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left / 1.3)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Número de países");

    //Añadiendo título al eje X
    this.svg.append("text")
      .attr("font-family", "Arial, Helvetica, sans-serif")
      .style("font-size", "12px").style("font", "sans-serif")
      .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom / 1.5) + ")")
      .style("text-anchor", "middle")
      .text("Intervalos sobre porcentajes de obesidad");
  }

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any) {

    let obesity;

    for (let i = 1; i < csvRecordsArray.length; i++) {
      let currentRecord = (<string>csvRecordsArray[i]).split(',');


      if (!isNaN(parseFloat(currentRecord[24]))) {
        obesity = parseFloat(currentRecord[24].trim().replace(/['"]+/g, ''));
      } else {
        obesity = 0;
      }
      this.values.push({ "Intervalos sobre porcentajes de obesidad": obesity });
      this.values3d.push({ obesity });
    }



  }

  getHeaderArray(csvRecordsArr: any) {
    let headers = (<string>csvRecordsArr[0]).split('\",');
    let headerArray = [];
    for (let j = 0; j < headers.length; j++) {
      headerArray.push(headers[j]);
    }
    return headerArray;
  }

}
