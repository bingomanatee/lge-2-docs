function scn(a, b){
  return a === b ? 'active' : ''
}

function PageHeader(props) {
  const {active} = props;
  return <header>
    <div id="logo">
      <ig className="large" src="/static/img/Logo.svg"/>
      <img className="medium" src="/static/img/Logo-sm.svg"/>
    </div>
    <div id="header-menu">
      <span className="small"><b>LGE</b></span>
      <span className={scn(active, 'home')}>
        <a href="/">
      <img className="large" src="/static/img/home-icon.svg"/>
      <img className="not-large" src="/static/img/home-icon-sm.svg"/>
        </a>
    </span>
      <span className={scn(active, 'compare')}><a href="/compare">Compare</a></span>
      <span className={scn(active, 'starting')}><a href="/starting">Getting Started</a></span>
      <span className={scn(active, 'react')}><a href="/react">LGE with React</a></span>
      <span className={scn(active, 'recipes')}><a href="/recipes">Recipes</a></span>
      <span className={scn(active, 'api')}><a href="/apis">API</a></span>
      <span className={scn(active, 'github')}><a href="https://github.com/bingomanatee/looking-glass-engine-2">Github</a></span>
    </div>
    <div id="header-title">
      <div className="lead-in not-small">
        Wonderland Labs Presents
      </div>
      <div className="title not-small">
        Looking Glass Engine <small><code>3.1</code></small>
      </div>
    </div>
  </header>
}

export default PageHeader;
