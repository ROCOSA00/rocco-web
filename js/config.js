/*
 * Conexión con Supabase: formulario de booking y próximas fechas.
 * Los datos de contacto visibles están en index.html, sección Booking.
 *
 * La "publishable key" de Supabase está pensada para ir en el navegador:
 * solo permite lo que dejen las políticas RLS (aquí, enviar solicitudes
 * de booking). NUNCA pongas aquí la contraseña de la base de datos ni la
 * "secret key".
 */
window.ROCCO_CONFIG = {
  supabaseUrl: 'https://rrnatexjlwsdocmkkqoz.supabase.co',
  supabaseKey: 'sb_publishable_oEmNtIk2jhdxVehHDS-Mbg_tkzWpA7T',
  bookingTable: 'booking_requests',
  gigsTable: 'gigs',

  // Se muestran si el formulario no consigue enviar la solicitud.
  email: 'djroccolive@gmail.com',
  instagram: 'https://www.instagram.com/djroccolive/',
};
