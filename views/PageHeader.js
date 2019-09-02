function PageHeader() {
  return <header>
    <div id="logo">
      <img className="large" src="/static/img/Logo.svg"/>
      <img className="medium" src="/static/img/Logo-sm.svg"/>
    </div>
    <div id="header-menu">
      <span>LGE:</span>
      <span>
      <img className="large" src="/static/img/home-icon.svg"/>
      <img className="medium" src="/static/img/home-icon-sm.svg"/>
    </span>
      <span>Introduction</span>
      <span className="active">Compare</span>
      <span>Integration</span>
      <span>Recipes</span>
      <span>API</span>
      <span>Github</span>
    </div>
    <div id="header-title">
      <div className="lead-in">
        Wonderland Labs Presents
      </div>
      <div className="title">
        Looking Glass Engine
      </div>
    </div>
  </header>
}

export default PageHeader;
