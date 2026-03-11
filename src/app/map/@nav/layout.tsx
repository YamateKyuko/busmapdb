import Seridashi from './seridashi';

import style from './nav.module.css';

export default function Layout(props: {
  children: React.ReactNode,
}) {
  return (
    <Seridashi
      className={style.nav}
    >
      {props.children}

    </Seridashi>
  )
};