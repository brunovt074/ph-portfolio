export const bookingOffersQuery = `*[_type == "sesionReservable" && activa == true] | order(orden asc){
  titulo,
  "slug": slug.current,
  "faceta": faceta->slug.current,
  descripcion,
  precio,
  duracionMinutos,
  porcentajeSena,
  orden
}`;
