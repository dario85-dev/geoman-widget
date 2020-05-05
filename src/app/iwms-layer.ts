import {WMSOptions} from "leaflet";

export interface IWmsLayer {
  baseUrl: string;
  options?:WMSOptions
}
