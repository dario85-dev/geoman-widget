import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  SimpleChanges,
  OnChanges,
  Output,
  EventEmitter,
} from "@angular/core";
import * as L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import { v4 as uuidv4 } from "uuid";
import intersect from "@turf/intersect";
import union from "@turf/union";
import { GeoJSON, FeatureCollection, Polygon } from "geojson";
import { IWmsLayer } from "./../iwms-layer";

@Component({
  selector: "app-map-editor",
  templateUrl: "./map-editor.component.html",
  styleUrls: ["./map-editor.component.scss"],
})
export class MapEditorComponent implements OnInit, AfterViewInit, OnChanges {
  mapId: string;
  map: L.Map;

  wmsLayerGroup: L.LayerGroup = new L.LayerGroup<any>();
  jsonLayerGroup: L.LayerGroup = new L.LayerGroup<any>();
  //borderLayerGroup: GeoJSON;
  borderLayerGroup: L.LayerGroup = new L.LayerGroup<any>();
  drawedLayerGroup: L.LayerGroup = new L.LayerGroup<any>();

  layerList: L.Layer[] = [];

  editMode: boolean = false;
  dragMode: boolean = false;
  deleteMode: boolean = false;

  @Input() shapes: GeoJSON;
  @Input() borders: FeatureCollection;
  @Input() wmsLayers: IWmsLayer[];

  private geojsonLayer: L.GeoJSON;
  @Output() onModified = new EventEmitter<L.GeoJSON>();

  inFillOpacity: string = "1";

  attrToColor: string = "niv";

  palette = [
    {
      opacity: "1",
      color: "#ffff00",
      value: "1",
      name: "Siccità liv 1 ",
      hide: false,
    },
    {
      opacity: "1",
      color: "#ffaa00",
      value: "2",
      name: "Siccità liv 2 ",
      hide: false,
    },
    {
      opacity: "1",
      color: "#e70000",
      value: "3",
      name: "Siccità liv 3 ",
      hide: false,
    },
    {
      opacity: "1",
      color: "#730000",
      value: "4",
      name: "Siccità liv 4 ",
      hide: false,
    },
  ];

  choosedPalette = this.palette[0];

  drawControl;

  drawControlOptions: any = {
    // position: 'topleft',
    drawPolygon: false,
    drawMarker: false,
    drawCircleMarker: false,
    drawPolyline: false,
    drawRectangle: false,
    drawCircle: false,
    cutPolygon: false,
    pinningOption: false,
    snappingOption: false,
  };

  setMap() {
    const baseLayer: L.TileLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    );
    const viewerOptions: L.MapOptions = {
      layers: [baseLayer],
    };
    this.map = L.map(this.mapId, viewerOptions);
    console.log("InitMap");

    //add layer groups
    this.wmsLayerGroup.addTo(this.map);
    this.jsonLayerGroup.addTo(this.map);
    this.borderLayerGroup.addTo(this.map);
    this.drawedLayerGroup.addTo(this.map);
  }

  setDesignTool() {
    // @ts-ignore
    L.PM.initialize();

    this.map.on("pm:create", (e) => {
      this.map.removeLayer(e.layer);

      //this.drawedLayerGroup.addLayer(e.layer);

      let borderPolygon: Polygon = {
        // @ts-ignore
        coordinates: this.borders.features[0].geometry.coordinates,
        type: "Polygon",
      };

      let intPolygon: Polygon = {
        // @ts-ignore
        coordinates: e.layer.toGeoJSON().geometry.coordinates,
        type: "Polygon",
      };

      // @ts-ignore
      const poly3 = intersect(borderPolygon, intPolygon);

      new L.GeoJSON(poly3, {
        // @ts-ignore
        style: (jsonFeature) => {
          return {
            color: this.choosedPalette.color,
            fillColor: this.choosedPalette.color,
            fillOpacity: this.inFillOpacity,
          };
        },
      }).addTo(this.drawedLayerGroup);
    });
  }

  constructor() {
    this.mapId = uuidv4();
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.setMap();
    this.loadBorder();
    this.loadShapes();
    this.loadWmss();
    this.setDesignTool();
  }

  enableDrawer() {
    let options = {
      snappable: true,
      templineStyle: {},
      hintlineStyle: {},
      pathOptions: {
        // add leaflet options for polylines/polygons
        color: this.choosedPalette.color,
        fillColor: this.choosedPalette.color,
        fillOpacity: this.inFillOpacity,
      },
    };

    // @ts-ignore
    this.map.pm.enableDraw("Polygon", options);
  }

  canToggle() {
    return this.dragMode || this.editMode || this.deleteMode;
  }

  toggleDragMode() {
    // @ts-ignore
    this.map.pm.toggleGlobalDragMode();
    this.dragMode = !this.dragMode;
  }

  toggleEditMode() {
    // @ts-ignore
    this.map.pm.toggleGlobalEditMode({
      // @ts-ignore
      limitMarkersToCount: 10,
    });
    this.editMode = !this.editMode;
  }

  toggleRemoveMode() {
    // @ts-ignore
    this.map.pm.toggleGlobalRemovalMode();
    this.deleteMode = !this.deleteMode;
  }

  setOpacity(p) {
    this.jsonLayerGroup.eachLayer((l) => {
      // @ts-ignore
      l.eachLayer((subl) => {
        if (subl.feature.properties.niv == p.value) {
          subl.setStyle({
            fillOpacity: p.opacity,
            opacity: p.opacity,
          });
        }
      });
    });
  }

  setHided(p) {
    this.jsonLayerGroup.eachLayer((l) => {
      p.opacity = p.hide ? 0 : 1;
      // @ts-ignore
      l.eachLayer((subl) => {
        if (subl.feature.properties.niv == p.value) {
          subl.setStyle({
            fillOpacity: p.opacity,
            opacity: p.opacity,
          });
        }
      });
    });
  }

  setEditable(p) {
    this.jsonLayerGroup.eachLayer((l) => {
      // @ts-ignore
      l.eachLayer((subl) => {
        if (subl.feature.properties.niv == p.value && p.editable) {
          subl.pm.enable({
            limitMarkersToCount: 10,
          });
        } else {
          subl.pm.disable();
        }
      });
    });
  }

  loadBorder() {
    if (this.borders && this.borderLayerGroup && this.map) {
      this.borderLayerGroup.clearLayers();
      // @ts-ignore
      let layer = new L.GeoJSON(this.borders, {
        // @ts-ignore
        pmIgnore: true,
        style: (feature) => {
          return {
            color: "#000000",
            fillOpacity: 0,
            weight: 1,
          };
        },
      });
      this.borderLayerGroup.addLayer(layer);
      this.map.fitBounds(layer.getBounds());
    }
  }

  loadShapes() {
    if (this.jsonLayerGroup && this.map) {
      this.jsonLayerGroup.clearLayers();
      this.geojsonLayer = new L.GeoJSON(this.shapes, {
        // @ts-ignore
        pmIgnore: false,
        style: (feature) => {
          let color = this.palette.filter(
            (v) => v.value == feature.properties[this.attrToColor].toString()
          )[0].color;
          return {
            color: color,
            fillColor: color,
            fillOpacity: 1,
          };
        },
      });
      this.jsonLayerGroup.addLayer(this.geojsonLayer);

      this.geojsonLayer.on("pm:edit", (e) => {
        console.log("pm:edit", e);
        this.onModified.emit(this.geojsonLayer);
      });
    }
  }

  loadWmss() {
    if (this.wmsLayers && this.wmsLayerGroup && this.map) {
      this.wmsLayerGroup.clearLayers();
      this.wmsLayers.map((layer: IWmsLayer) => {
        this.wmsLayerGroup.addLayer(
          new L.TileLayer.WMS(layer.baseUrl, layer.options)
        );
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty("borders")) this.loadBorder();
    if (changes.hasOwnProperty("shapes")) this.loadShapes();
    if (changes.hasOwnProperty("wmsLayers")) this.loadWmss();
  }
}
