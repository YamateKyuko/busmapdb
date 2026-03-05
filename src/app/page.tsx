// File: app/page.tsx
// import { neon } from '@neondatabase/serverless';

import Image from "next/image";
import Link from "next/link";

import style from "./app.module.css";

export default function Page() {
  // async function create(formData: FormData) {
  //   'use server';
  //   // Connect to the Neon database
  //   const sql = neon(`${process.env.DATABASE_URL}`);
  //   const comment = formData.get('comment');
  //   // Insert the comment from the form into the Postgres database
  //   await sql`INSERT INTO comments (comment) VALUES (${comment})`;
  // }

  return (
    <html lang="ja-JP">
      <head>
        {/* <link rel="icon" href="/icon/icon.png" type="image/png" sizes="<generated>" />
        <link rel="icon" href="/icon/icon.jpg" type="image/jpeg" sizes="<generated>" /> */}
        <link rel="icon" href="/icon/icon.svg" type="image/svg" sizes="<generated>" />
      </head>
      <body>
        <h1>Yamakyu busmapdb</h1>
        <Image src="/busmapf.svg" alt="icon" width={200} height={100} className={style.image} />
        <Link href="/map">Busmap F System</Link>
      </body>
        
    </html>
  );
}