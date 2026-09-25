/*
 * Configuración de la web. Es lo único que necesitas tocar para cambiar
 * datos de contacto o la conexión con Supabase.
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

  // Opcionales: si los rellenas aparecen en la sección Booking.
  email: '',     // p. ej. 'booking@tudominio.com'
  whatsapp: '',  // número con prefijo y sin "+", p. ej. '34600111222'

  instagram: 'https://www.instagram.com/djroccolive/',
};
