import { Screen } from '@/types';

export interface ScreenInspect {
  metaData: MetaData;
  asset_id: number;
  all_layer_assets_found: boolean;
  total_layer_assets: number;
  layers: ScreenInspectLayer[];
  project_asset_directory_id: number;
  screen_colors: Array<Array<number | BackgroundColorEnum>>;
  __exportedimagepaths: ImagePath[];
  asset: Asset;
  screen: {
    imageUrl: string;
    thumbnailUrl: string;
    height: number;
    width: number;
  };
  grid: {
    gridSize: number;
    thickGridTimes: number;
  };
  layout: Layout;
  width: number;
  name: string;
  backgroundColor: Color;
  documentColors: Color[];
  pageindex: string;
  height: number;
  assetDirectoryPath: string;
  asset_directory_id: number;
  max_density: number;
  pagename: string;
  guides: Guides;
  ruleroffsets: Ruleroffsets;
  project_id: number;
  id: Screen['id'];
  displayScale: number;
  typefaces: TypefaceElement[];
}

type Color = [
  number, // red
  number, // green
  number, // blue
  number, // alpha
  string, // name or identifier
  string, // category
];

export interface ImagePath {
  originalobjectid: string;
  layernameformatted: string;
  layerpath: string;
  symbolasset: string;
  pageid: string;
  layername: string;
  objectid: string;
  key: string;
  fullpath: string;
}

export interface Asset {
  filetype: string;
  clientFilename: string;
  extractionStatus: ExtractionStatus;
  assetID: number;
  link: string;
  formattedFilesize: string;
}

export interface ExtractionStatus {
  message: string;
  stateid: string;
  code: number;
}

export enum BackgroundColorEnum {
  Black60 = 'Black/60%',
  Black87 = 'Black/87%',
  Empty = '',
  ForeignSwatches = 'Foreign Swatches',
  GlobalColors = 'Global Colors',
  The054432744565217395 = '0.54432744565217395',
  The059999999999999998 = '0.59999999999999998',
  White100 = 'White/100%',
}

export interface Guides {
  vertical: any[];
  horizontal: any[];
}

export interface ScreenInspectLayer {
  height: number;
  flippedHorizontal: boolean;
  isInitiallyVisible: boolean;
  layers?: PurpleLayer[];
  y: number;
  order: number;
  shadows: any[];
  width: number;
  exportOptions: any[];
  x: number;
  index: string;
  name: string;
  id: string;
  type: LayerType;
  flippedVertical: boolean;
  rotation: number;
  opacity: number;
  fillColor: Array<number[]>;
  sharedStyleID?: string;
  gradients?: any[];
  innerShadows?: any[];
  borders?: any[];
  borderRadius?: number[];
  sharedStyle?: SharedStyle;
}

export interface PurpleLayer {
  height: number;
  flippedHorizontal: boolean;
  isInitiallyVisible: boolean;
  symbol?: boolean;
  symbolMaster?: SharedStyle;
  layers?: FluffyLayer[];
  y: number;
  gradients?: any[];
  order: number;
  symbolID?: string;
  shadows: Shadow[];
  width: number;
  innerShadows?: any[];
  borders?: any[];
  exportOptions: any[];
  x: number;
  index: string;
  id: string;
  name: string;
  type: LayerType;
  flippedVertical: boolean;
  rotation: number;
  opacity: number;
  fillColor: Array<Array<BackgroundColorEnum | number>>;
  sharedStyleID?: string;
  baselinetextframe?: Baselinetextframe;
  textAttributes?: TextAttribute[];
  sharedStyle?: SharedStyle;
  verticaltextalignment?: 'top' | 'middle';
  text?: string;
  typeface?: AttributesClass;
  borderRadius?: number[];
}

export interface Baselinetextframe {
  height: number;
  y: number;
  width: number;
  x: number;
}

export interface FluffyLayer {
  height: number;
  flippedHorizontal: boolean;
  isInitiallyVisible: boolean;
  sharedStyleID?: string;
  y: number;
  gradients?: any[];
  order: number;
  shadows: any[];
  innerShadows?: any[];
  width: number;
  borders?: any[];
  exportOptions: any[];
  x: number;
  index: string;
  id: string;
  name: string;
  type: LayerType;
  borderRadius?: number[];
  flippedVertical: boolean;
  sharedStyle?: SharedStyle;
  rotation: number;
  opacity: number;
  fillColor: Array<Array<number | BackgroundColorEnum>>;
  symbol?: boolean;
  symbolMaster?: SharedStyle;
  layers?: TentacledLayer[];
  grouplayout?: Grouplayout;
  symbolID?: SymbolID;
  baselinetextframe?: Baselinetextframe;
  textAttributes?: TextAttribute[];
  verticaltextalignment?: 'top' | 'middle';
  text?: string;
  typeface?: AttributesClass;
}

export interface Grouplayout {
  layoutanchor: Layoutanchor;
  axis: Axis;
}

export interface TentacledLayer {
  height: number;
  flippedHorizontal: boolean;
  isInitiallyVisible: boolean;
  symbol?: boolean;
  symbolMaster?: SharedStyle;
  layers: StickyLayer[];
  y: number;
  gradients?: any[];
  order: number;
  grouplayout?: Grouplayout;
  symbolID?: string;
  shadows: any[];
  width: number;
  innerShadows?: any[];
  borders?: any[];
  exportOptions: any[];
  x: number;
  index: string;
  id: string;
  name: string;
  type: LayerType;
  flippedVertical: boolean;
  rotation: number;
  opacity: number;
  fillColor: any[];
}

export interface StickyLayer {
  height: number;
  flippedHorizontal: boolean;
  isInitiallyVisible: boolean;
  layers?: IndigoLayer[];
  y: number;
  order: number;
  grouplayout?: Grouplayout;
  shadows: any[];
  width: number;
  exportOptions: any[];
  x: number;
  index: string;
  name: string;
  id: string;
  type: LayerType;
  flippedVertical: boolean;
  rotation: number;
  opacity: number;
  fillColor: any[];
  sharedStyleID?: FluffySharedStyleID;
  sharedStyle?: SharedStyle;
  symbol?: boolean;
  symbolMaster?: SharedStyle;
  gradients?: any[];
  symbolID?: string;
  innerShadows?: any[];
  borders?: any[];
  text?: string;
  baselinetextframe?: Baselinetextframe;
  typeface?: AttributesClass;
  textAttributes?: TextAttribute[];
  verticaltextalignment?: 'top' | 'middle';
}

export interface IndigoLayer {
  isInitiallyVisible: boolean;
  sharedStyleID?: string;
  y: number;
  gradients?: any[];
  shadows: any[];
  width: number;
  baselinetextframe?: Baselinetextframe;
  index: string;
  name: string;
  textAttributes?: TextAttribute[];
  flippedVertical: boolean;
  sharedStyle?: SharedStyle;
  verticaltextalignment?: 'top' | 'middle';
  opacity: number;
  height: number;
  flippedHorizontal: boolean;
  text?: string;
  order: number;
  innerShadows?: any[];
  borders?: Border[];
  exportOptions: any[];
  x: number;
  typeface?: AttributesClass;
  id: string;
  type: LayerType;
  rotation: number;
  fillColor: Array<Array<number | string>>;
  borderRadius?: number[];
  symbol?: boolean;
  symbolMaster?: SharedStyle;
  layers?: IndecentLayer[];
  symbolID?: string;
  grouplayout?: Grouplayout;
}

export interface Border {
  placement: Placement;
  color: number[];
  type: BorderType;
  thickness: number;
}

export interface IndecentLayer {
  height: number;
  flippedHorizontal: boolean;
  isInitiallyVisible: boolean;
  sharedStyleID?: string;
  y: number;
  gradients?: any[];
  order: number;
  shadows: any[];
  innerShadows?: any[];
  width: number;
  borders?: Border[];
  exportOptions: any[];
  x: number;
  index: string;
  id: string;
  name: string;
  type: LayerType;
  borderRadius?: number[];
  flippedVertical: boolean;
  sharedStyle?: SharedStyle;
  rotation: number;
  opacity: number;
  fillColor: Array<Array<number | BackgroundColorEnum>>;
  layers?: HilariousLayer[];
  text?: string;
  baselinetextframe?: Baselinetextframe;
  typeface?: AttributesClass;
  textAttributes?: TextAttribute[];
  verticaltextalignment?: 'top' | 'middle';
  symbol?: boolean;
  symbolMaster?: SharedStyle;
  symbolID?: string;
}

export interface HilariousLayer {
  height: number;
  flippedHorizontal: boolean;
  isInitiallyVisible: boolean;
  symbol?: boolean;
  symbolMaster?: SharedStyle;
  layers?: HilariousLayer[];
  y: number;
  gradients: any[];
  order: number;
  symbolID?: string;
  shadows: any[];
  width: number;
  innerShadows: any[];
  borders: any[];
  exportOptions: any[];
  x: number;
  index: string;
  id: string;
  name: Name;
  type: LayerType;
  flippedVertical: boolean;
  rotation: number;
  opacity: number;
  fillColor: Array<Array<BackgroundColorEnum | number>>;
  sharedStyleID?: PurpleSharedStyleID;
  borderRadius?: number[];
  sharedStyle?: SharedStyle;
}

export enum Name {
  ColorInformation = '\ud83c\udfa8 Color information',
  ComponentsIconsHint = 'Components/Icons/Hint',
  HintIconIconsInformation = '\ud83d\udd35 Hint icon-Icons/information',
}

export interface SharedStyle {
  name: string;
  id: string;
  sourceLibraryName: string;
  type?: SharedStyleType;
}

export enum SharedStyleType {
  LayerStyle = 'layerStyle',
  TextStyle = 'textStyle',
}

export enum PurpleSharedStyleID {
  F151A2CA33F4466AA037Bbb1Fea8Bc7B = 'F151A2CA-33F4-466A-A037-BBB1FEA8BC7B',
}

export enum LayerType {
  Group = 'group',
  Path = 'path',
  Text = 'text',
}

export interface TextAttribute {
  location: number;
  length: number;
  attributes: AttributesClass;
}

export interface AttributesClass {
  transform?: Transform;
  paragraphSpacing: number;
  weight: Weight;
  lineHeight: number;
  characterSpacing: number;
  typeface: TypefaceEnum;
  fontColor: Array<number | BackgroundColorEnum>;
  fontSize: number;
  alignment?: Alignment;
}

export enum FluffySharedStyleID {
  The2C497Abd01Bf49B895BdF0C6Fe5Cab33 = '2C497ABD-01BF-49B8-95BD-F0C6FE5CAB33',
  The43699CbbCb9E4D7CB1ACB65C186D9574 = '43699CBB-CB9E-4D7C-B1AC-B65C186D9574',
  The7832E7AFFecc45518D498400Cc48C772 = '7832E7AF-FECC-4551-8D49-8400CC48C772',
}

export enum SymbolID {
  F56906A7F97D44CbAff7Bf03C262493B = 'F56906A7-F97D-44CB-AFF7-BF03C262493B',
  The8Fe6B36EFf8F4Ac699Ed646F33340756 = '8FE6B36E-FF8F-4AC6-99ED-646F33340756',
}

export interface Shadow {
  blur: string;
  y: number;
  color: Array<number | string>;
  x: number;
  spread: number;
}

export interface Layout {
  darkColor: number[];
  rows: Rows;
  columns: Columns;
  lightColor: number[];
}

export interface Columns {
  gutterWidth: number;
  drawVertical: boolean;
  totalWidth: number;
  horizontalOffset: number;
  gutterOutside: boolean;
  numberOfColumns: number;
  columnWidth: number;
}

export interface Rows {
  drawHorizontalLines: boolean;
  drawHorizontal: boolean;
  gutterHeight: number;
  rowHeightMultiplication: number;
}

export interface MetaData {
  pluginbuildversion: string;
  sv: string;
  filecreated: Date;
  source: string;
  craftextractbuild: string;
  userInfo: UserInfo;
  filename: string;
  pv: string;
  filesize: string;
  pluginname: string;
  document_id: string;
  sourcebuildversion: string;
  filelastmodified: Date;
  documentID: string;
  generated: Date;
  craftextractversion: string;
}

export interface UserInfo {}

export interface Ruleroffsets {
  y: number;
  x: number;
}

export interface TypefaceElement {
  weight: Weight;
  typeface: TypefaceEnum;
}
