'use client';

import React from "react";

export default function Scroller(props: {

}) {
  const pRef = React.useRef<HTMLParagraphElement>(null);
  React.useEffect(() => {
    const p = pRef.current;
    if (!p) return;
    const h = p.getBoundingClientRect().height;
    window.scroll(0, h);
  }, []);
  return (
    <p ref={pRef}>
      まいど、<wbr />ありがとうございます。<wbr />
      しばらく、<wbr />おまちください。<br />
      
      Yamakyu
      <br />
      <br />

      <noscript>
        JavaScriptを許可ください。
      </noscript>
    </p>
  );
};