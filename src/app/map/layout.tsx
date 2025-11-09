function Layout(props: {
  children: React.ReactNode,
  map: React.ReactNode,
  nav: React.ReactNode,
}) {
  return (
    <>
      {props.children}
      {props.map}
      {props.nav}
    </>
  )
}

export default Layout;