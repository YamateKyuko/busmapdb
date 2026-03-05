import Image from 'next/image';

import "./globals.css";

import style from './map.module.css';



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
    <html lang="ja-JP">
      <head>
        <link rel="icon" href="/icon/icon.png" type="image/<generated>" sizes="<generated>" />
        <link rel="icon" href="/icon/icon.jpg" type="image/<generated>" sizes="<generated>" />
        <link rel="icon" href="/icon/icon.svg" type="image/<generated>" sizes="<generated>" />
      </head>
      <body id="dark">
        <header className={style.header}>
          <Image src="/busmapf3.svg" alt="Busmap F" width={600} height={200} className={style.image} />
        </header>
        <main className={style.main}>
          <figure className={style.figure}>
            {props.map}
            
              {props.nav}
          </figure>
        </main>
        <footer></footer>
      </body>
    </html>
  )
}

export default Layout;