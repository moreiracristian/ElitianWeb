import Link from 'next/link'

export const metadata = {
  title: 'Términos y Condiciones | Elitian',
  description: 'Términos y condiciones de uso, compra y política de privacidad de Elitian.',
}

function Seccion({ id, titulo, children }: { id?: string; titulo: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-bold text-stone-800 mb-4 pb-2 border-b border-stone-200">
        {titulo}
      </h2>
      <div className="text-stone-600 text-sm leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  )
}

export default function TerminosPage() {
  const ultimaActualizacion = '7 de junio de 2026'

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Hero */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <p className="text-green-600 text-xs font-semibold uppercase tracking-widest mb-2">Legal</p>
          <h1 className="text-3xl font-bold text-stone-800 mb-3">Términos y Condiciones</h1>
          <p className="text-stone-500 text-sm">
            Última actualización: {ultimaActualizacion}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Índice lateral */}
          <nav className="lg:w-52 shrink-0">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sticky top-24">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Contenido</p>
              <ul className="space-y-1.5 text-sm">
                {[
                  ['#general', 'Condiciones generales'],
                  ['#compras', 'Proceso de compra'],
                  ['#pagos', 'Medios de pago'],
                  ['#envios', 'Envíos y entrega'],
                  ['#devoluciones', 'Devoluciones'],
                  ['#productos', 'Sobre los productos'],
                  ['#privacidad', 'Privacidad de datos'],
                  ['#contacto', 'Contacto'],
                ].map(([href, label]) => (
                  <li key={href}>
                    <a href={href} className="text-stone-500 hover:text-green-700 transition-colors">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Contenido principal */}
          <main className="flex-1 space-y-10">

            {/* Intro */}
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-sm text-stone-600 leading-relaxed">
              Al crear una cuenta o realizar una compra en <strong>Elitian</strong>, aceptás los presentes
              términos y condiciones en su totalidad. Te recomendamos leerlos con atención antes de
              continuar.
            </div>

            <Seccion id="general" titulo="1. Condiciones generales de uso">
              <p>
                <strong>Elitian</strong> es un emprendimiento argentino dedicado a la venta de productos
                de cosmética e higiene natural. El sitio web elitian.com.ar (en adelante «el Sitio») es
                operado por Elitian, con domicilio en la ciudad de Resistencia, provincia del Chaco,
                República Argentina.
              </p>
              <p>
                El acceso y uso del Sitio implica la aceptación plena y sin reservas de estos términos.
                Elitian se reserva el derecho de modificarlos en cualquier momento; las modificaciones
                entrarán en vigencia a partir de su publicación en el Sitio.
              </p>
              <p>
                Para crear una cuenta debés ser mayor de 18 años o contar con autorización de un adulto
                responsable. Es tu responsabilidad mantener la confidencialidad de tus datos de acceso.
              </p>
            </Seccion>

            <Seccion id="compras" titulo="2. Proceso de compra">
              <p>
                Al confirmar un pedido, estás realizando una oferta de compra sujeta a la disponibilidad
                del stock y a la confirmación por parte de Elitian. Recibirás un mensaje de WhatsApp
                para coordinar el pago y la entrega.
              </p>
              <p>
                Los precios publicados en el Sitio son en pesos argentinos (ARS) e incluyen IVA.
                Elitian se reserva el derecho de modificar los precios sin previo aviso, pero los pedidos
                ya confirmados respetan el precio vigente al momento de la compra.
              </p>
              <p>
                El contrato de compraventa se perfecciona cuando Elitian confirma el pedido mediante
                WhatsApp o correo electrónico.
              </p>
            </Seccion>

            <Seccion id="pagos" titulo="3. Medios de pago">
              <p>Aceptamos los siguientes medios de pago:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>
                  <strong>Transferencia bancaria / alias CBU</strong> — obtené un{' '}
                  <span className="text-green-700 font-medium">20% de descuento</span> sobre el total
                  del pedido.
                </li>
                <li>
                  <strong>Efectivo al retirar</strong> — también con{' '}
                  <span className="text-green-700 font-medium">20% de descuento</span>. Coordinamos
                  punto de entrega por WhatsApp.
                </li>
                <li>
                  <strong>MercadoPago</strong> — tarjeta de crédito (hasta 3 cuotas sin interés),
                  débito o dinero en cuenta MP. Se procesa en el sitio seguro de MercadoPago.
                </li>
              </ul>
              <p>
                Elitian no almacena datos de tarjetas de crédito. Los pagos online son gestionados
                íntegramente por MercadoPago bajo sus propios estándares de seguridad.
              </p>
            </Seccion>

            <Seccion id="envios" titulo="4. Envíos y entrega">
              <p>
                Realizamos envíos dentro de la República Argentina. Los tiempos y costos de envío
                varían según la localidad de destino y se informan al confirmar el pedido.
              </p>
              <ul className="list-disc ml-5 space-y-1">
                <li>
                  <strong>Envío gratis</strong> en compras superiores a $10.000 dentro de la ciudad
                  de Resistencia, Chaco.
                </li>
                <li>
                  Envíos al interior del país a través de correo o servicio de mensajería; el costo
                  corre por cuenta del comprador salvo promoción vigente.
                </li>
                <li>
                  También podés retirar tu pedido en persona coordinando por WhatsApp.
                </li>
              </ul>
              <p>
                Los plazos de entrega son estimativos y pueden verse afectados por factores externos
                como demoras del servicio de correo o situaciones de fuerza mayor.
              </p>
            </Seccion>

            <Seccion id="devoluciones" titulo="5. Devoluciones y cambios">
              <p>
                De acuerdo con la Ley de Defensa del Consumidor N.º 24.240 y sus modificatorias,
                tenés derecho a revocar la compra dentro de los <strong>10 días corridos</strong> desde
                la recepción del producto, siempre que este se encuentre sin uso y en su empaque
                original.
              </p>
              <p>
                No se aceptan devoluciones de productos que:
              </p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Hayan sido abiertos o usados por razones de higiene.</li>
                <li>No cuenten con su empaque original.</li>
                <li>Hayan sido dañados por mal uso o almacenamiento incorrecto.</li>
              </ul>
              <p>
                Para iniciar una devolución o cambio, contactanos por WhatsApp o email dentro del plazo
                indicado. Los gastos de envío de la devolución corren por cuenta del comprador, salvo
                que el producto presente un defecto de fabricación.
              </p>
            </Seccion>

            <Seccion id="productos" titulo="6. Sobre los productos">
              <p>
                Todos nuestros productos son de cosmética e higiene natural. Las descripciones,
                ingredientes y modos de uso publicados en el Sitio son provistos por los fabricantes
                o elaboradores. Elitian no se responsabiliza por reacciones alérgicas individuales;
                recomendamos leer los ingredientes antes de la compra.
              </p>
              <p>
                Las imágenes de los productos son ilustrativas. El color real puede variar levemente
                respecto a lo mostrado en pantalla debido a diferencias de calibración.
              </p>
              <p>
                El stock mostrado en el Sitio es en tiempo real pero puede variar. En caso de que un
                producto esté agotado luego de confirmado tu pedido, te contactaremos para ofrecerte
                una alternativa o el reembolso correspondiente.
              </p>
            </Seccion>

            <Seccion id="privacidad" titulo="7. Política de privacidad">
              <p>
                Elitian recopila los siguientes datos personales con el fin exclusivo de gestionar
                pedidos y mejorar tu experiencia:
              </p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Nombre, apellido y nombre de usuario.</li>
                <li>Dirección de correo electrónico.</li>
                <li>Número de teléfono (opcional, solo si lo proporcionás).</li>
                <li>Dirección de entrega.</li>
                <li>Historial de compras.</li>
              </ul>
              <p>
                Tus datos <strong>no serán vendidos ni cedidos a terceros</strong> con fines
                comerciales. Solo se comparten con proveedores de logística o servicios de pago en la
                medida estrictamente necesaria para completar tu pedido.
              </p>
              <p>
                Podés solicitar en cualquier momento el acceso, rectificación o eliminación de tus
                datos escribiéndonos a{' '}
                <a href="mailto:elitian.proyectos@gmail.com" className="text-green-700 hover:underline">
                  elitian.proyectos@gmail.com
                </a>
                . Cumplimos con la Ley N.º 25.326 de Protección de Datos Personales de la
                República Argentina.
              </p>
              <p>
                Utilizamos cookies técnicas necesarias para el funcionamiento del Sitio (sesión,
                carrito). No usamos cookies de seguimiento publicitario de terceros.
              </p>
            </Seccion>

            <Seccion id="contacto" titulo="8. Contacto y jurisdicción">
              <p>
                Para cualquier consulta relacionada con estos términos podés contactarnos:
              </p>
              <ul className="list-disc ml-5 space-y-1">
                <li>
                  Email:{' '}
                  <a href="mailto:elitian.proyectos@gmail.com" className="text-green-700 hover:underline">
                    elitian.proyectos@gmail.com
                  </a>
                </li>
                <li>WhatsApp: +54 9 362 413-5017</li>
                <li>Resistencia, Chaco, Argentina</li>
              </ul>
              <p>
                Ante cualquier controversia, las partes se someten a la jurisdicción de los Tribunales
                Ordinarios de la ciudad de Resistencia, Provincia del Chaco, República Argentina,
                renunciando a cualquier otro fuero que pudiera corresponder.
              </p>
            </Seccion>

            <div className="bg-stone-100 rounded-2xl p-5 text-xs text-stone-500 leading-relaxed">
              Estos términos y condiciones son efectivos desde el {ultimaActualizacion}. Al continuar
              usando el Sitio o al crear una cuenta después de esta fecha, aceptás los términos
              actualizados.
            </div>

            <div className="text-center pt-4">
              <Link
                href="/cuenta/registro"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors text-sm"
              >
                Volver al registro
              </Link>
            </div>

          </main>
        </div>
      </div>
    </div>
  )
}
