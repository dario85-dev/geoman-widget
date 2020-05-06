import { Component } from '@angular/core';

import {GeoJSON, GeoJsonObject} from "geojson";

import {IWmsLayer} from "./iwms-layer";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {

  constructor( private http: HttpClient) {
    this.http.get('assets/combinado_201604_simplified.geojson').subscribe((json: GeoJSON) => {
      this.jsonCombinado = json;
    });
  }

  testWmsLayer: IWmsLayer = {
    baseUrl: 'http://geoserver.cimafoundation.org/geoserver/wms',
    options: {layers: 'dew:GHS_Pyramid', opacity: 0.5 }
  }

  wmsLayers = [this.testWmsLayer]

  jsonCombinado: GeoJSON;

  shapeInBolivia: GeoJSON = {
    "type": "FeatureCollection",
    "features": [{
      "type": "Feature",
      "properties": {
        "shape": "Polygon",
        "maps": ["default-map"],
        "name": "Unnamed Layer",
        "category": "default",
        "id": "64a27e93-fff6-4ad6-9882-5a8acad7fb06"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-67.587891, -16.341226],
            [-66.401367, -18.895893],
            [-63.413086, -17.392579],
            [-65.478516, -16.88866],
            [-64.511719, -15.707663],
            [-65.610352, -14.392118],
            [-67.807617, -14.817371],
            [-67.587891, -16.341226]
          ]
        ]
      }
    }]
  };
  border: GeoJSON = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -62.68798828125,
                -22.12635475991967
              ],
              [
                -61.962890625,
                -20.055931265194438
              ],
              [
                -59.3701171875,
                -19.228176737766248
              ],
              [
                -58.6669921875,
                -19.456233596018
              ],
              [
                -58.095703125,
                -19.84939395842278
              ],
              [
                -57.76611328124999,
                -17.685895196738663
              ],
              [
                -58.4033203125,
                -16.383391123608387
              ],
              [
                -60.35888671875,
                -15.072123545811683
              ],
              [
                -61.9189453125,
                -13.261333170798274
              ],
              [
                -63.39111328125,
                -12.576009912063787
              ],
              [
                -65.50048828125,
                -11.566143767762844
              ],
              [
                -65.3466796875,
                -9.838979375579331
              ],
              [
                -65.91796875,
                -9.752370139173285
              ],
              [
                -67.69775390625,
                -10.639013775260524
              ],
              [
                -69.58740234375,
                -11.092165893501988
              ],
              [
                -68.92822265625,
                -14.243086862716888
              ],
              [
                -69.08203125,
                -16.446622271646618
              ],
              [
                -69.80712890625,
                -17.35063837604883
              ],
              [
                -68.48876953125,
                -19.456233596018
              ],
              [
                -68.62060546875,
                -20.571081893508183
              ],
              [
                -67.8955078125,
                -22.938159639316396
              ],
              [
                -66.3134765625,
                -21.800308050972575
              ],
              [
                -64.31396484375,
                -22.87744046489713
              ],
              [
                -63.96240234375,
                -22.024545601240337
              ],
              [
                -62.68798828125,
                -22.12635475991967
              ]
            ]
          ]
        }
      }
    ]
  }
}
