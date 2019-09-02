import HeadView from "../views/Head";
import PageHeader from '../views/PageHeader';
import List from '../views/List';

function Home() {
  return <div>
    <HeadView/>
    <PageHeader active="compare"/>
    <main>
      <article>
        <h1>Comparison</h1>
        <p>
          Looking Glass Engine began as a Freactal upgrade, but evolved into its own system; it uses RxJS under the hood
          and no longer depends on React or any view system to access state.
        </p>
        <p>
          It badly wants to be used over Redux which is verbose and oblivious to the largely asynchronous nature
          of web transactions.
        </p>
        <p>The update notification/subscription is straight RxJS, and it is easily interoperable with an RxJS update
           system, as it has a BehaviorSubject as its <tt>.stream</tt> property.</p>
        <List>
          <List.Item>
            <List.ItemHead>Like Redux</List.ItemHead>
            <ul>
              <li>LGE is functional</li>
              <li>Its actions mutate state</li>
              <li>Its state is injected into view</li>
              <li>
                One or many values can be changed in a single stroke
              </li>
              <li>All change is managed through actions
              </li>
            </ul>
          </List.Item>
          <List.Item>
            <List.ItemHead>Like RXJS</List.ItemHead>
            <ul>
              <li>LGE is not tied to React features, versions or customs</li>
              <li>It is view-layer-agnostic</li>
              <li>It is synchronous by nature</li>
              <li>It is predictable and easy to test and observe</li>
            </ul>
          </List.Item>
          <List.Item>
            <List.ItemHead>Like Freactal</List.ItemHead>
            <ul>
              <li>A LGE State's structure is fully exposed in its configuration file</li>
              <li>It has a very small footprint</li>
              <li>It doesn't rely on a broad library of "helpers"</li>
              <li>It is promise-friendly</li>
              <li>It is designed to be approachable, transparent and compact.</li>
            </ul>
          </List.Item>
        </List>

        <List>
          <List.Item>
            <List.ItemHead>Unlike Redux</List.ItemHead>
            <ul>
              <li> LGE is self-contained: all the views and state values are in a single file
              </li>
              <li>Actions are properties of a state sandbox, not scattered and difficult to track or enumerate</li>
              <li>
                You can define field values and update actions in a single line.
              </li>
              <li>
                Asynchronous handling is innate, not a third party addon with more ritual and caveats
              </li>
            </ul>
          </List.Item>
          <List.Item>
            <List.ItemHead>
              Unlike RXJS
            </List.ItemHead>
            <ul>
              <li>LGE is concise, opinionated and centralized</li>
              <li>It can be leared and used quickly</li>
              <i>Its documentation is under 5,000 pages</i>
            </ul>
            <small>
              *It does have an RXJS
              BehaviorSubject at its heart, so you can use RxJS to control update flow if you want.
            </small>
          </List.Item>
          <List.Item>
            <List.ItemHead>
              Unlike Freactal
            </List.ItemHead>
            <ul>
              <li>LGE doesn't bind you to any inheritance model of state</li>
              <li>
                It doesn't force you to inherit fields from above it in the DOM heirarchy so properties
                are predictable and localized
              </li>
              <li>Its creator still loves it</li>
            </ul>
          </List.Item>
        </List>
        <p>There are a few features of LGE that are unique to all/most of these state systems:
        </p>
        <List>
          <List.Item>
            <List.ItemHead>
              Property Definition with Validation
            </List.ItemHead>
            <p>
              Properties can be defined with simple (or not simple) validation to ensure that
              they are not fed bad values.
              Bad value attempts can be trapped and managed by observing to change.
            </p>
          </List.Item>
          <List.Item>
            <List.ItemHead>
              Transactional Locking
            </List.ItemHead>
            <p>
              Actions can be executed with transactional locking (in development). so that
              <ul>
                <li>multiple changes trigger a single update</li>
                <li>errors reset state to its previous known value</li>
              </ul>
            </p>
          </List.Item>
          <List.Item>
            <List.ItemHead>
              Testable from the ground up
            </List.ItemHead>
            <p>
              It is build with unit testing and as Stores are not buried in DOM, they can be
              tested by any unit test system without reference to the view layer.
            </p>
          </List.Item>
        </List>
      </article>
    </main>
  </div>
}

export default Home
