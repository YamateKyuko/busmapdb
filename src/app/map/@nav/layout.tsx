import style from './nav.module.css';

export default function Layout(props: {
  children: React.ReactNode,
}) {
  return (
    <figcaption className={style.nav}>
    {/* <article className={style.article}> */}
      <div className={style.spacer}></div>
      <details open className={style.details}>
        <summary>Navigation</summary>
        
          {props.children}
        
      </details>
    {/* </article> */}
    </figcaption>
  )
};