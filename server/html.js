import urlJoin from 'url-join';

export default function generateHtml(config) {
  return `
    <!doctype>
    <html lang="en-us">
      <head>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width initial-scale=1 maximum-scale=1.0 user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-title" content="Scorpio"/>
        <meta name="application-name" content="Scorpio"/>
        <meta name="msapplication-TileColor" content="#da532c"/>
        <meta name="msapplication-TileImage" content="/img/favicons/mstile-144x144.png"/>

        <meta property="og:url" content="${config.EXTERNAL_BASE_URL}" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Scorpio" />
        <meta property="og:description" content="The Scorpio is linking you into Australia’s world-class 21st century patisserie purchasing/learning system." />
        <meta property="og:image" content="${urlJoin(config.EXTERNAL_BASE_URL, '/img/screenshot.png')}" />

        <title>Scorpio</title>
        <meta property="description" content="The Scorpio is linking you into Australia’s world-class 21st century patisserie purchasing/learning system." />

        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="57x57" href="/img/favicons/apple-touch-icon-57x57.png"/>
        <link rel="apple-touch-icon" sizes="60x60" href="/img/favicons/apple-touch-icon-60x60.png"/>
        <link rel="apple-touch-icon" sizes="72x72" href="/img/favicons/apple-touch-icon-72x72.png"/>
        <link rel="apple-touch-icon" sizes="76x76" href="/img/favicons/apple-touch-icon-76x76.png"/>
        <link rel="apple-touch-icon" sizes="114x114" href="/img/favicons/apple-touch-icon-114x114.png"/>
        <link rel="apple-touch-icon" sizes="120x120" href="/img/favicons/apple-touch-icon-120x120.png"/>
        <link rel="apple-touch-icon" sizes="144x144" href="/img/favicons/apple-touch-icon-144x144.png"/>
        <link rel="apple-touch-icon" sizes="152x152" href="/img/favicons/apple-touch-icon-152x152.png"/>
        <link rel="apple-touch-icon" sizes="180x180" href="/img/favicons/apple-touch-icon-180x180.png"/>
        <link rel="icon" type="image/png" href="/img/favicons/favicon-32x32.png" sizes="32x32"/>
        <link rel="icon" type="image/png" href="/img/favicons/android-chrome-192x192.png" sizes="192x192"/>
        <link rel="icon" type="image/png" href="/img/favicons/favicon-96x96.png" sizes="96x96"/>
        <link rel="icon" type="image/png" href="/img/favicons/favicon-16x16.png" sizes="16x16"/>
        <link rel="manifest" href="/manifest.json"/>
        ${config.NODE_ENV === 'production' ? '<link href="/dist/styles.css" media="screen, projection" rel="stylesheet" type="text/css" />' : ''}
      </head>
      <body>
        <div id="content"></div>
        <script>window.__config = ${JSON.stringify(config)}</script>
        <script src="/dist/bundle.js"></script>
      </body>
    </html>
  `;
}
