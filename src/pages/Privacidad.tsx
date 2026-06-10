import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacidad = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-5 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>

        <h1 className="text-3xl font-bold mb-2">Política de Privacidad — Futhora</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Última actualización: 10 de junio de 2026
        </p>

        <p className="mb-8 leading-relaxed">
          Esta Política de Privacidad describe cómo la aplicación móvil Futhora
          (contacto:{" "}
          <a
            href="mailto:anubiis1717@gmail.com"
            className="text-primary underline"
          >
            anubiis1717@gmail.com
          </a>
          ) trata la información de sus usuarios.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            1. Información que no recopilamos
          </h2>
          <p className="leading-relaxed">
            Futhora no requiere registro ni cuenta de usuario. La app no solicita
            ni almacena: nombre, correo electrónico, teléfono, contactos,
            ubicación precisa, fotos ni archivos del dispositivo.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            2. Información recopilada por terceros
          </h2>
          <p className="leading-relaxed mb-3">
            <strong>Google AdMob (anuncios):</strong> La app muestra anuncios
            mediante Google AdMob. Para ello, Google puede recopilar
            automáticamente el identificador de publicidad del dispositivo
            (Advertising ID), datos técnicos del dispositivo (modelo, sistema
            operativo, idioma) y datos de interacción con los anuncios. Esta
            información la trata Google conforme a sus políticas:{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline break-all"
            >
              https://policies.google.com/privacy
            </a>{" "}
            y{" "}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline break-all"
            >
              https://policies.google.com/technologies/partner-sites
            </a>
            . Puedes restablecer tu identificador de publicidad o desactivar la
            personalización de anuncios en: Ajustes de Android → Google →
            Anuncios.
          </p>
          <p className="leading-relaxed">
            <strong>Datos deportivos:</strong> La app consulta servicios externos
            para mostrar información deportiva pública (calendarios, resultados,
            estadios). Estas consultas no incluyen datos personales del usuario.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">3. Permisos de la app</h2>
          <p className="leading-relaxed">
            La app únicamente utiliza el permiso de acceso a Internet, necesario
            para cargar la información deportiva y los anuncios.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">4. Menores de edad</h2>
          <p className="leading-relaxed">
            La app no está dirigida a menores de 13 años y no recopila
            deliberadamente información de menores.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            5. Cambios a esta política
          </h2>
          <p className="leading-relaxed">
            Cualquier cambio se publicará en esta misma página, actualizando la
            fecha del encabezado.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">6. Contacto</h2>
          <p className="leading-relaxed">
            Si tienes preguntas sobre esta Política de Privacidad, escribe a:{" "}
            <a
              href="mailto:anubiis1717@gmail.com"
              className="text-primary underline"
            >
              anubiis1717@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
};

export default Privacidad;
