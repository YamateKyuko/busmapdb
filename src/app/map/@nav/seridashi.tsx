'use client';

import style from './nav.module.css'
import React, { WheelEventHandler } from "react";

export default function Seridashi(props: {
  className: string,
  // summary: React.ReactNode,
  children: React.ReactNode
}) {
  const [height, setHeight] = React.useState<number | null>(null);
  const [isPrevent, setIsPrevent] = React.useState<boolean>(false);
  const [isPointerDown, setIsPointerDown] = React.useState<boolean>(false);
  const navRef = React.useRef<HTMLElement>(null)

  const onWheel = (e: React.WheelEvent<HTMLElement>) => {
    const refc = navRef.current;
    if (!refc) return;
    const h = refc.clientHeight + e.deltaY;
    setHeight(h);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!e.buttons) return;
    if (!isPointerDown) return;

    const refc = navRef.current;
    if (!refc) return;

    const h = refc.clientHeight - e.movementY;
    setHeight(h);

    e.currentTarget.setPointerCapture(e.pointerId);

    if (isPrevent == false) setIsPrevent(true);
  };

  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    if (isPrevent) {
      e.preventDefault();
      setIsPrevent(false);
    }
  }

  const onPointerDown = () => setIsPointerDown(true);
  const onPointerUp = () => setIsPointerDown(false);

  const eventHandlers = {
    onWheel: onWheel,
    onPointerMove: onPointerMove,
    onClick: onClick,
    onPointerDown: onPointerDown,
    onPointerUp: onPointerUp
  }

  // React.useEffect(() => {
  //   console.log(isPointerDown)
  // }, [isPointerDown])

  return (
    <figcaption
      className={style.nav}
      ref={navRef}
      style={
        {height: `${height}px`}
      }
    >
      <details
        open
        className={style.details}
      >
        <summary
          {...eventHandlers}
        >
          {/* Navigation */}
        </summary>
        <article className={style.article}>
          {props.children}
        </article>
      </details>
    </figcaption>
  )
}