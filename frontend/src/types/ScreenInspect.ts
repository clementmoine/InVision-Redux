import { Screen } from '@/types';

export interface ScreenInspect {
  metaData: MetaData;
  asset_id: number;
  all_layer_assets_found: boolean;
  total_layer_assets: number;
  layers: Layer[];
  project_asset_directory_id: number;
  screen_colors: Color[];
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

export type Color = [
  number, // red
  number, // green
  number, // blue
  number, // alpha
  string?, // name or identifier
  string?, // category
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

export interface Guides {
  vertical: number[];
  horizontal: number[];
}

interface GradientStop {
  location: number;
  color: Color;
}

export interface Gradient {
  to: {
    y: number;
    x: number;
  };
  from: {
    y: number;
    x: number;
  };
  stops: GradientStop[];
  type: string;
}

export interface Shadow {
  blur: string;
  y: number;
  color: Color;
  x: number;
  spread: number;
}

interface Border {
  placement: string;
  color: Color;
  type: string;
  thickness: number;
}
interface ExportOption {
  asset_id: number;
  prefix: string;
  height: number;
  path: string;
  scale: number;
  status: string;
  width: number;
  suffix: string;
  name: string;
  screen_version: string;
  format: string;
}

export interface BaselineTextFrame {
  height: number;
  y: number;
  width: number;
  x: number;
}

export interface Layer {
  height: number;
  flippedHorizontal: boolean;
  isInitiallyVisible: boolean;
  y: number;
  order: number;
  shadows?: Shadow[];
  width: number;
  exportOptions: ExportOption[];
  x: number;
  index: string;
  id: string;
  name: string;
  type: 'path' | 'line' | 'text' | 'group' | 'bitmap';
  flippedVertical: boolean;
  rotation: number;
  opacity: number;
  fillColor: Color[];
  symbol?: boolean;
  symbolMaster?: SharedStyle;
  sharedStyle?: SharedStyle;
  layers?: Layer[];
  gradients?: Gradient[];
  grouplayout?: GroupLayout;
  symbolID?: string;
  innerShadows?: Shadow[];
  borders?: Border[];
  text?: string;
  baselinetextframe?: BaselineTextFrame;
  typeface?: TextAttribute['attributes'];
  textAttributes?: TextAttribute[];
  verticaltextalignment?: string;
  sharedStyleID?: string;
  borderRadius?: number[];
}
export interface GroupLayout {
  layoutanchor:
    | 'top to bottom'
    | 'bottom to top'
    | 'left to right'
    | 'right to left'
    | 'middle'
    | 'center';
  axis: 'horizontal' | 'vertical';
}

export interface SharedStyle {
  name: string;
  id: string;
  sourceLibraryName: string;
  type?: 'layerStyle' | 'textStyle';
}

export interface TextAttribute {
  location: number;
  length: number;
  attributes: {
    transform?: string;
    paragraphSpacing: number;
    weight: string;
    lineHeight: number;
    characterSpacing: number;
    typeface: string;
    fontColor: Color;
    fontSize: number;
    alignment?: string;
  };
}

export interface Layout {
  darkColor: Color;
  rows: Rows;
  columns: Columns;
  lightColor: Color;
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

interface UserInfo {
  com_invision_dsm: {
    libraryMetadata: {
      sketchlibrariesdata: {
        textstylesmap: Record<string, string>;
        layerstylesmap: Record<string, string>; // Assuming layerstylesmap has a similar structure to textstylesmap
        symbolsmap: Record<string, string>;
      };
    };
  };
}

export interface Ruleroffsets {
  y: number;
  x: number;
}

export interface TypefaceElement {
  weight: string;
  typeface: string;
}
