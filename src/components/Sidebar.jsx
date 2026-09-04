function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="logo">
        <div className="logo-icon">
          €
        </div>

        <span>
          Despesas
        </span>
      </div>

      <nav>

        <a
          href="/"
          className="nav-item active"
        >
          <span>⌂</span>
          Dashboard
        </a>

        <a
          href="/despesas"
          className="nav-item"
        >
          <span>€</span>
          Despesas
        </a>

        <a
          href="/estatisticas"
          className="nav-item"
        >
          <span>↗</span>
          Estatísticas
        </a>

        <a
          href="/categorias"
          className="nav-item"
        >
          <span>▦</span>
          Categorias
        </a>

      </nav>
<div className="sidebar-bottom">

  <a href="#definicoes" className="nav-item">
    <span>⚙</span>
    Definições
  </a>



</div>

    </aside>
  );
}

export default Sidebar;