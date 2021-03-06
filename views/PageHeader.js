function scn(a, b){
  return a === b ? 'active' : ''
}

function PageHeader(props) {
  const {active} = props;
  return <header>
    <div id="logo">
      <img className="large" src="/static/img/Logo.png"/>
      <img className="medium" src="/static/img/Logo-sm.png"/>
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
      <span className={scn(active, 'hooks')}><a href="/hooks">Hooks</a></span>
      <span className={scn(active, 'api')}><a href="/apis">API</a></span>
      <span className={scn(active, 'api')}><a href="/v3_2">v3.2</a></span>
      <span className={scn(active, 'github')}><a href="https://github.com/bingomanatee/looking-glass-engine-3" target="github">Github</a></span>
    </div>
    <div id="header-title">
      <div className="lead-in not-small">
        Wonderland Labs Presents
      </div>
      <div className="title not-small">
        Looking Glass Engine <small><code>3.1 (and 3.2 beta)</code></small>
      </div>
    </div>
  </header>
}

export default PageHeader;
