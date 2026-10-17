import { ajustes } from './ajustes';
import { antesDespues } from './antesDespues';
import { copia } from './copia';
import { faceta } from './faceta';
import { foto } from './foto';
import { itemInfo } from './itemInfo';
import { listaLocalizada, parrafoLocalizado, slugLocalizado, textoLocalizado, tituloLocalizado } from './localizados';
import { paginaCopias } from './paginaCopias';
import { paginaInicio } from './paginaInicio';
import { paginaMarcas } from './paginaMarcas';
import { paginaObra } from './paginaObra';
import { paqueteMarca } from './paqueteMarca';
import { serie } from './serie';
import { servicio } from './servicio';
import { textosDelSitio } from './textosDelSitio';
import { tituloConItalica } from './tituloConItalica';

export const schemaTypes = [
  tituloConItalica,
  textoLocalizado,
  parrafoLocalizado,
  tituloLocalizado,
  listaLocalizada,
  slugLocalizado,
  servicio,
  itemInfo,
  foto,
  faceta,
  paqueteMarca,
  antesDespues,
  serie,
  copia,
  ajustes,
  paginaInicio,
  paginaMarcas,
  paginaObra,
  paginaCopias,
  textosDelSitio,
];
