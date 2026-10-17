export const schedulingQuery = `*[_id == "agendaReservas"][0]{
  ventanas[]{ dia, desde, hasta },
  pasoMinutos,
  margenMinutos,
  anticipacionHoras,
  horizonteDias,
  retencionMinutos,
  zonaHoraria
}`;
