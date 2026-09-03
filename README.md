# Globalbox Promo IA

Aplicación web gratuita que analiza el texto de imágenes promocionales, identifica dos precios, calcula el descuento y crea una pieza lista para redes sociales.

## Cómo abrirla

Ejecuta `node server.js` en esta carpeta y abre `http://localhost:3000`.

No requiere clave de API, cuenta ni tarjeta. La primera vez necesita internet para descargar Tesseract.js y el modelo OCR en español. Después, el análisis se realiza en el navegador y la imagen no se sube a nuestros servidores.

## Uso

1. Selecciona, arrastra o pega una imagen con `Ctrl+V`.
2. Espera mientras el OCR lee los textos.
3. Elige el estilo y el formato.
4. En **Agregar logo de Globalbox**, selecciona el archivo del logo. La aplicación recorta automáticamente el centro y lo presenta dentro de un círculo.
5. Si un dato fue leído incorrectamente, abre **Revisar o corregir datos detectados**.
6. Descarga la promoción en PNG.

La fotografía se ajusta automáticamente para mostrarla completa, centrada y sin deformaciones. Si su proporción no coincide con el marco, el espacio restante utiliza un fondo suave creado a partir de la misma imagen.

Las imágenes generadas incluyen el acceso visual a WhatsApp `0939669867` y a Instagram `@globalbox.ec`, además de un banco de 35 frases promocionales seleccionadas automáticamente o de forma manual.

## Limitaciones reales

El modo gratuito usa OCR, no un modelo de visión generativa. Funciona mejor con precios grandes, horizontales, contrastados y claramente etiquetados como "antes", "ahora" u "oferta". Puede fallar con texto borroso, inclinado, decorativo o muy pequeño.

ChatGPT Plus (USD 20 al mes) no incluye créditos de la API de OpenAI y no permite conectar directamente esta aplicación al plan. Para obtener análisis visual más preciso habría que usar una API independiente con cobro por consumo o un servicio que tenga un nivel gratuito disponible.

## Instalación en celular

En Android o computadora, abre el sitio publicado y pulsa **Instalar app**. En iPhone o iPad, abre el sitio en Safari, pulsa **Compartir** y después **Agregar a inicio**.

La interfaz queda disponible sin conexión después de visitarla. El primer análisis OCR requiere internet para descargar el lector y el idioma español; el navegador puede reutilizarlos posteriormente desde su caché.
