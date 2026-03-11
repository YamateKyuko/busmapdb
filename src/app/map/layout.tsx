import Image from 'next/image';

import "./globals.css";

import style from './map.module.css';
import Scroller from './scroller';



export const metadata = {
  title: 'Busmap F',
  description: 'バスの頻度で地図がみえる、Busmap F System',
  keywords: ['bus'],
};

function Layout(props: {
  children: React.ReactNode,
  map: React.ReactNode,
  nav: React.ReactNode,
}) {
  return (
    <html lang="ja-JP" className={style.html}>
      <head>
        <link rel="icon" href="/icon/icon.png" type="image/<generated>" sizes="<generated>" />
        <link rel="icon" href="/icon/icon.jpg" type="image/<generated>" sizes="<generated>" />
        <link rel="icon" href="/icon/icon.svg" type="image/<generated>" sizes="<generated>" />
        {/* <meta name="viewport" content="initial-scale=1.0, viewport-fit=cover" /> */}
      </head>
      <body id="dark" className={style.body}>
        <header className={style.header} id="sc">
          <Scroller />
          
          <Image src="/busmapf3.svg" alt="Busmap F" width={600} height={200} className={style.image} />
        </header>
        <main className={style.main}>
          {/* <noscript>JavaScriptが有効になっていません。</noscript> */}
          <figure className={style.figure}>
            {props.map}
            {props.nav}
          </figure>
        </main>
        {/*  */}
      </body>
    </html>
  )
}

export default Layout;