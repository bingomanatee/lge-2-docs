import HeadView from "../views/Head";
import PageHeader from '../views/PageHeader';
import List from '../views/List';
import l from "../utils/l";

function Home() {
  return <div>

    <HeadView/>

    <PageHeader active="api"/>

    <main>
      <article>
        <h1>
          ValueStream 3.0 API
        </h1>

        <p>
          ValueStream is an observable object class. It has a few nonstandard "quirks" that exist to skirt the
          referential issues and class property issues that are endemic to JavaScript; namely:
        </p>
        <dl>
          <dt>Property and Method Name conflicts</dt>
          <dd>
            You never really know when your property name conflicts with a local property, or a local method, or one of
            your own methods. As such user methods and user properties are kept in two different maps, so their
            names can be the same as internal ValueStream methods. For practicality the name keys are limited to
            proper javaScript names -- i.e., <code>/^[_a-zA-Z][_a-zA-Z0-9]*$/</code>
          </dd>
          <dt><code>this</code>/self referencing</dt>
          <dd>
            <code>this</code> is the root of so any JavaScript bugs its not funny. So, any user defined methods are passed
            the valueStream itself as their first argument that <i>that</i> is the safest way to access properties
            and methods of a value stream from within the body of a user defined method. (Methods for those not
            plugged into object lingo is the proper name for a method attached to an object that is intended to
            have access to its host.)
          </dd>
          <dt>Code go boom</dt>
          <dd>
            Trapping javaScript and async errors is a lot of work. Nobody wants to constantly write try/catch,
            a 5-line clot of code, around every custom method. So, ValueStream runs user methods in a sandbox,
            routing any user errors, even those in a promise context, to its error stream. A word of warning:
            this means code you call method "a" from method "b" and expect method "a" to short circuit in the
            case of an error, it might not; examine the result for an `.error` property to be safe.
          </dd>
        </dl>
        <p>This API defines the <i>public</i> features of a ValueStream</p>
        <h2>Methods</h2>

        <h2>Constructor</h2>
        <p>
          The ValueStream constructor has a single argument, the streams' name.
          The name of a root ValueStream is useful for error tracking.
          <i>DO NOT</i> pass more than one argument into a new ValueStream.
        </p>
        <code>
          <pre>
            {l(`
            const myStream = new ValueStream('articleStream');
            `
            )}
          </pre>
        </code>

        <h2><code>method(name:string, body:function, transactional: boolean = false): this</code></h2>
        <p>
          Adds a user method to the ValueStream. The first argument passed to the function
          when it is invoked will be the ValueStream instance itself. All other arguments given by the user
          follow. It is a curried method; it returns it's valueStream.
        </p>
        <code>
          <pre>
            {l(`
const myStream = new ValueStream('articleStream')
  .property('count', 0, 'integer')
  .method('increment', (stream) => stream.do.setCount(stream.my.count + 1))
  .method('incBy', (stream, n) => stream.do.setCount(stream.my.count + n));

const sub = myStream.subscribe((stream) => console.log('count is ', stream.my.count));
myStream.do.increment();
myStream.do.incBy(10);
myStream.do.increment();

/**

 count is  0
 count is  1
 count is  11
 count is  12
**/
            `
            )}
          </pre>
        </code>
        <p>Once a method is defined it cannot be redefined.
           (If you want to do so with stupid violence, clear its entry in the <code>_methods</code>. map. or, rethink your life.)
        </p>

        <p>The fourth argument is powerful; use with caution. If truthy, it will suppress all updates to streams until
           the method is complete. This is useful for instance if you want to switch two values, but only issue one
           update.</p>
        <code>
          <pre>
            {l(`
const latLon = new ValueStream('latlon')
  .propertyRange('lat', 0, {min: -90, max: 90})
  .propertyRange('lon', 0, {min: -180, max: 180})
  .method('flip', (stream) => {
    const lon = stream.my.lon;
    const lat = stream.my.lat;
    stream.do.setLat(lon);
    stream.do.setLon(lat);
  }, true);

let line = 0;
latLon.do.setLat(20);
latLon.do.setLon(80);
const sub = latLon.subscribe((stream) => console.log(line++, 'lat', stream.my.lat, 'lon', stream.my.lon));
latLon.do.flip();

// by contrast this is the same structure without transactional locking
const latLonNoTrans = new ValueStream('latlon')
  .propertyRange('lat', 0, {min: -90, max: 90})
  .propertyRange('lon', 0, {min: -180, max: 180})
  .method('flip', (stream) => {
    const lon = stream.my.lon;
    const lat = stream.my.lat;
    stream.do.setLat(lon);
    stream.do.setLon(lat);
  });

let line2 = 0;
latLonNoTrans.do.setLat(20);
latLonNoTrans.do.setLon(80);
const sub2 = latLonNoTrans.subscribe((stream) => console.log(line2++, 'lat', stream.my.lat, 'lon', stream.my.lon));
latLonNoTrans.do.flip();

/**
 * result:
 
 0 'lat' 20 'lon' 80
1 'lat' 80 'lon' 20
0 'lat' 20 'lon' 80
1 'lat' 80 'lon' 80
2 'lat' 80 'lon' 20
*/
`)}
          </pre>
        </code>
        <p>
          Notice how the second stream echoes twice for the changes of it's "flip" method, once for each change; the
          first
          gives both changes in a single stream, reducing median updates.
        </p>
        <h3>Where this can be a problem: async methods or long poll methods</h3>
        <p>Transactions are great for synchronous simple methods - not so much for those that have delayed completion
           time
           due to computational intensity or asynchronous completion.
           Methods that take a long time to compute should <i>not be stream methods at all</i>; write external functions
           or handlers
           or better yet compute in a web worker or server and update upon completion.
        </p>
        <p>Async functions may also be poor candidates for transactions; at the very least, split them into two blocks
           one that executes prior to the promise, and one that executes upon completion.</p>
        <code>
          <pre>
            {l(`
            const {ValueStream} = require('@wonderlandlabs/looking-glass-engine');
const _ = require('lodash');
const letters = 'abcdefghijklmnopaqrstuvwxyz'.split('');
const {table} = require('table');

function makeName() {
  return _(_.range(0, _.random(3, 10)))
    .map(n => _(letters).shuffle().pop())
    .value().join('')
}

const makeStudent = () => {
  const student = {
    name: makeName(), tests: new Map(),
    setTest(test) {
      // console.log('setting test', test.test, 'of', student.name, 'to', test);
      student.tests.set(test.test, test);
    }
  };
  return student;
};

const fakeServer = {
  testDatabase: new Map(),
  addTests(testName, tests) {
    tests.forEach((test) => {
      const {student} = test;
      fakeServer.testDatabase.set(testName + "\\t" + student, {...test, name: testName}); // tests are stored by pseudo key
      // to ensure that no student is recorded as taking the same test more than once.
    });
    return new Promise(done => {
      setTimeout(() => done(tests), 500); // wait 500 seconds and return the tests, to simulate HTTP
    });
  },
  assignGrades(testName) {
    const summary = [];

    function assignGrade(group, grade) {
      let worstResult = group.reduce((correct, test) => {
        return Math.min(correct, test.correct);
      }, Number.POSITIVE_INFINITY);
      summary.forEach(test => {
        if (test.correct >= worstResult) {
          test.grade = grade;
        }
      });
    }

    fakeServer.testDatabase.forEach(test => {
      if (test.name === testName) {
        test.grade = 'F';
        summary.push(test)
      }
    });

    const ordered = _.sortBy(summary, 'correct').reverse();
    assignGrade(ordered.slice(0, ordered.length * 0.75), 'C');
    assignGrade(ordered.slice(0, ordered.length * 0.5), 'B');
    assignGrade(ordered.slice(0, ordered.length * 0.25), 'A');

    return ordered;
  }
};

/**
 * this simulates a stream to track grade school students' work on tests.
 * Tests have different counts of questions; the number of correct answers are recorded as a number.
 * where the grades for a test are graded on a curve; the top 10% of the class gets an A,
 * the second 10% of the class gets a B, etc.
 *
 * The grades are adjusted by a fake server; while the grades are computed the displayed grade is changed to 'pending' until the results come back.
 */

const gradeTester = new ValueStream('gradeTester')
  .property('students', new Map())
  .method('makeStudent', (stream, count = 0) => {
    let madeCount = 0;
    do {
      let student = makeStudent();
      if (!stream.my.students.has(student.name)) {
        stream.my.students.set(student.name, student);
        stream.do.setStudents(stream.my.students); // this ensures a next event is emitted to list the student
        madeCount += 1;
        if (madeCount >= count) {
          break;
        }
      }
    } while (true);
  }, true)
  .property('testNames', [], 'array')
  .method('runTest', (stream, testName, questionCount) => {
    const newTests = [];
    stream.my.students.forEach((student) => {
      newTests.push({
        test: testName,
        student: student.name,
        questions: questionCount,
        correct: _.random(0, questionCount),
        grade: 'pending'
      });
    });
    stream.do.setTests([...stream.my.tests, ...newTests]);
    stream.do.setTestNames([...stream.my.testNames, testName]);
    console.log('test names are now ', stream.my.testNames);
    return newTests;
  }, true)
  .method('submitTests', async (stream, testName, tests) => {
    await fakeServer.addTests(testName, tests);
  })
  .method('addTestsToStudents', (stream, tests) => {
    if (Array.isArray(tests)) {
      tests.forEach(test => {
        const stud = stream.do.getStudent(test.student);
        if(stud) {
          stream.do.addTestToStudent(stud, test);
        }
      });
    }
  }, true)
  .method('addTestToStudent', (stream, student, test) => {
    student.tests.set(test.test, test);
    const students = stream.my.students;
    students.set(student.name, student);
    stream.do.setStudents(students); // triggers an update, suppressed by the transactional locking of addTestsToStudents
  })
  .method('getStudent', (stream, name) => {
    return stream.my.students.get(name);
  })
  .method('getTestsByTestName', (stream, testName) => {
    return stream.my.tests.filter(({test}) => test === testName);
  })
  /**
   * this is the "quasi-transactional" method;
   * it itself is not transactional but some of the sub-methods it calls
   * are transactionally locked.
   */
  .method('computeTestGrades', async (stream, testName) => {
    const tests = stream.do.getTestsByTestName(testName);
    stream.do.addTestsToStudents(tests);
    tests.forEach((test) => {
      const stud = stream.do.getStudent(test.student);
      if (stud) {
        stud.setTest(test);
      }
    });
    await stream.do.submitTests(testName, tests);
    const newTests = await fakeServer.assignGrades(testName);
    await stream.do.addTestsToStudents(newTests);
  })
  // this method is for displaying a table of test data for a single test (or all tests if none specified
  .method('testTable', (stream, testName) => {
    const config = {
      columns: [
        {width: 20, align: 'left'},
        {width: 20, align: 'left'},
        {width: 20, align: 'right'},
        {width: 20, align: 'right'}
      ]
    };
    const tests = testName ? stream.do.getTestsByTestName(testName) : stream.my.tests;
    const data = tests
      .map(({student, test, correct, questions, grade}) => {
        return [student, test, correct, questions, grade]
      });
    return table([['student', 'test', 'correct', 'questions', 'grade'], ...data], config);
  })
  // this method describes the class progress across all tests.
  .method('classTable', (stream) => {
    const testNames = stream.my.testNames;
    const config = {
      columns: [
        {width: 20, align: 'left'},
        ...testNames.map(() => ({width: 20, align: 'right'}))
      ]
    };

    const data = [['Student', ...testNames]];

    stream.my.students.forEach((student) => {
      const row = [student.name, ...testNames.map(testName => {
        if (student.tests.has(testName)) {
          const {questions, correct, grade} = student.tests.get(testName);
          return (correct + '/' + questions + ': ' + (grade || 'pending'));
        } else {
          return ('---');
        }
      })];
      data.push(row);
    });
    return table(data, config);
  })
  .property('tests', [], 'array');

const sub = gradeTester.subscribe((stream) => {
  console.log('================== student status: ==================');
  console.log(stream.do.classTable());
}, (err) => {
  console.log('error: ', err);
});

gradeTester.do.makeStudent(30);
gradeTester.do.runTest('midterms', 30);
gradeTester.do.computeTestGrades('midterms')
  .then(() => {
    gradeTester.do.runTest('finals', 50);
    gradeTester.do.computeTestGrades('finals')
  });
            `)}
          </pre>
        </code>
        <hr/>

        <p>
          <code>addTestsToStudents</code>
          is transactionally locked to reduce noise from the many sub-calls of testToStudent.
          <code>computeTestGrades</code>
          is NOT transactionally locked; it has async calls in it that would drag down the streams; performance.
        </p>
        <p>Here are the sample echos from the data; for readability, some of the results in the middle are removed, but
           presented in the final report. Note that there are a <b>LOT</b> of sub-method updates; one for
           each <code>addTestToStudent</code> inside the loop of <code>addTestsToStudents</code>.
           By using locked sub-calls but not locking the async methods,
           we achieve a balance of reduced updates and non-blocking async calls to remote services.
        </p>

        <pre>
          {l(`================== student status: ==================
╔══════════════════════╗
║ Student              ║
╚══════════════════════╝

================== student status: ==================
╔══════════════════════╗
║ Student              ║
╟──────────────────────╢
║ jvjwvazjp            ║
╟──────────────────────╢
║ wsava                ║
╟──────────────────────╢
... rows omitted
╟──────────────────────╢
║ wjsoqyx              ║
╚══════════════════════╝

test names are now  [ 'midterms' ]
================== student status: ==================
╔══════════════════════╤══════════════════════╗
║ Student              │ midterms             ║
╟──────────────────────┼──────────────────────╢
║ jvjwvazjp            │ ---                  ║
╟──────────────────────┼──────────────────────╢
║ wsava                │ ---                  ║
╟──────────────────────┼──────────────────────╢
...rows omitted
╟──────────────────────┼──────────────────────╢
║ wjsoqyx              │ ---                  ║
╚══════════════════════╧══════════════════════╝

================== student status: ==================
╔══════════════════════╤══════════════════════╗
║ Student              │ midterms             ║
╟──────────────────────┼──────────────────────╢
║ jvjwvazjp            │ 9/30: pending        ║
╟──────────────────────┼──────────────────────╢
║ wsava                │ 7/30: pending        ║
╟──────────────────────┼──────────────────────╢
... rows omitted
╟──────────────────────┼──────────────────────╢
║ wjsoqyx              │ 25/30: pending       ║
╚══════════════════════╧══════════════════════╝

================== student status: ==================
╔══════════════════════╤══════════════════════╗
║ Student              │ midterms             ║
╟──────────────────────┼──────────────────────╢
║ jvjwvazjp            │ 9/30: C              ║
╟──────────────────────┼──────────────────────╢
║ wsava                │ 7/30: C              ║
╟──────────────────────┼──────────────────────╢
...rows omitted
╟──────────────────────┼──────────────────────╢
║ wjsoqyx              │ 25/30: A             ║
╚══════════════════════╧══════════════════════╝

================== student status: ==================
╔══════════════════════╤══════════════════════╤══════════════════════╗
║ Student              │ midterms             │ finals               ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ jvjwvazjp            │ 9/30: C              │ ---                  ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ wsava                │ 7/30: C              │ ---                  ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
... rows omitted
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ wjsoqyx              │ 25/30: A             │ ---                  ║
╚══════════════════════╧══════════════════════╧══════════════════════╝

================== student status: ==================
╔══════════════════════╤══════════════════════╤══════════════════════╗
║ Student              │ midterms             │ finals               ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ jvjwvazjp            │ 9/30: C              │ 19/50: pending       ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ wsava                │ 7/30: C              │ 23/50: pending       ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
...rows omitted
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ wjsoqyx              │ 25/30: A             │ 12/50: pending       ║
╚══════════════════════╧══════════════════════╧══════════════════════╝

================== student status: ==================
╔══════════════════════╤══════════════════════╤══════════════════════╗
║ Student              │ midterms             │ finals               ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ jvjwvazjp            │ 9/30: C              │ 19/50: C             ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ wsava                │ 7/30: C              │ 23/50: B             ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ hxmyq                │ 19/30: B             │ 12/50: C             ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ sqbawojzod           │ 6/30: F              │ 5/50: F              ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ atlboqplo            │ 1/30: F              │ 8/50: F              ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ jym                  │ 23/30: A             │ 8/50: F              ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ ewyvch               │ 10/30: C             │ 19/50: C             ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ udlpkk               │ 13/30: B             │ 25/50: B             ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ atcdogsh             │ 6/30: F              │ 15/50: C             ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ vfgzcgiwu            │ 1/30: F              │ 44/50: A             ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ wftdthu              │ 15/30: B             │ 2/50: F              ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ lbwdktd              │ 12/30: C             │ 17/50: C             ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ unpll                │ 30/30: A             │ 31/50: B             ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ qwv                  │ 9/30: C              │ 22/50: C             ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ inw                  │ 14/30: B             │ 26/50: B             ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ dbshqhc              │ 24/30: A             │ 32/50: A             ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ aqdwjikv             │ 14/30: B             │ 7/50: F              ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ yfvik                │ 9/30: C              │ 23/50: B             ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ yco                  │ 19/30: B             │ 35/50: A             ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ uoa                  │ 1/30: F              │ 49/50: A             ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ qbuzbaqhu            │ 29/30: A             │ 5/50: F              ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ hxjqdbafm            │ 6/30: F              │ 24/50: B             ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ lfdx                 │ 17/30: B             │ 25/50: B             ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ heqmgpfrs            │ 8/30: C              │ 4/50: F              ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ gpklgpao             │ 20/30: B             │ 36/50: A             ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ xrqcotsah            │ 6/30: F              │ 27/50: B             ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ tdi                  │ 0/30: F              │ 4/50: F              ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ uoe                  │ 24/30: A             │ 49/50: A             ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ lbla                 │ 24/30: A             │ 40/50: A             ║
╟──────────────────────┼──────────────────────┼──────────────────────╢
║ wjsoqyx              │ 25/30: A             │ 12/50: C             ║
╚══════════════════════╧══════════════════════╧══════════════════════╝`)}

        </pre>

        <h2><code>property(name:string, startValue, type: string):this</code></h2>

        <p>Defines a user accessible property; its name, start value and type. Type is actually the name of a
          <a href="https://github.com/enricomarino/is" target="is"><code>is</code></a> method.
          <i>it is not required</i> - you can define a parameter without specifying a type of data</p>

        <p>For reference here are the <code>is</code> type-checking function names:</p>

        <List>
          <List.Item>
            <List.ItemHead>General</List.ItemHead>
            <ul>
              <li>
                nil
              </li>
              <li>
                element
              </li>
              <li>
                bool
              </li>
              <li>
                date
              </li>
            </ul>
          </List.Item>
          <List.Item>
            <List.ItemHead>Numeric</List.ItemHead>
            <li>
              number
            </li>
            <li>
              infinite
            </li>
            <li>
              decimal
            </li>
            <li>
              integer
            </li>
            <li>
              nan
            </li>
            <li>
              even
            </li>
            <li>
              odd
            </li>
          </List.Item>
          <List.Item>
            <List.ItemHead>Structure</List.ItemHead>
            <ul>
              <li>
                array
              </li>
              <li>
                arraylike
              </li>
              <li>
                object
              </li>
              <li>
                fn (function)
              </li>
            </ul>
          </List.Item>
        </List>

        <p>
          This should be good for 90% of your use cases.
          If it is not you can pass a <i>function</i> as a third argument. This function is called with:
        </p>
        <ul>
          <li>The submitted value</li>
          <li>The name of the property (useful for error messages)</li>
          <li>the <code>is</code> library</li>
          <li>the stream itself</li>
        </ul>
        <p>If the property is not valid, return the reason why, as a string. If not return falsy value. Property tests
           must be
           synchronous. they <i>do not</i> have to return anything at all if the value is not bad.</p>
        <p>All the arguments are provided to help you write tests.
          <i>DO NOT</i> trigger your stream methods/change properties from inside test functions!</p>

        <h2><pre><code>{l(`propertyRange(name, value, params = {
          min: number = Number.NEGATIVE_INFINITY,
          max: number = Number.POSITIVE_INFINITY,
          type: string = 'number'}
          ):this`)}</code></pre>
        </h2>

        <p>
          creates a property (like the method above) that is a numeric value that is clamped between
          the minimum and maximum range of the third argument. you don't have to define <b>BOTH</b>
          <code>min</code> and <code>max</code>; though if you don't define <i>either</i> you probably
          want to use the regular <code>property(name, value, type)</code> method.
          If you don't define <code>type</code> its assumed to be 'number'; you can pass 'int' to confine
          results to integer values, or provide a custom test (see above).
        </p>

        <p>
          One fun fact: the <i>initial</i> value of the property defined with propertyRange is clamped to
          be within the min/max range that the params define, so it may not be the one you feed to the propertyRange
          method. </p>

        <h2><code>subscribe(onNext: function, onError: function, onDone):Subscriber</code></h2>
        <p>
          the observer-patterned method for tracking changes to the state of the ViewStream.
          Note all arguments  are optional. you can listen only to values
          (<code>myStream.subscribe((s) => console.log('stream is now: ', s.value))</code>,
          or to watch errors (<code>myStream.subscribe(null, (err) => console.log('ERROR: ', err))</code>.
        </p>
        <p>The return value of this method is a Subscription Object that has only one (documented)
           method: <code>.unsubscribe()</code>.
           The best practice is to trap this value whenever you subscribe and call it to close the subscription when you
           no longer care
           about the streams' state.
        </p>

        <h3>ProTip: summary methods</h3>
        <p>Methods can - but don't have to - update streams.
           They can also return filtered/processed values from the streams.
           so if you want to get an average, sum, or other calculation from your stream, write a method that operates
           on your data and returns a value. Just make sure the value isn't a function or promise; these will be
           executed/completed by the ValueStream sandbox. (wrap those dataTypes in an object or array).
        </p>

        <h2><code>get(name: string): var</code></h2>
        <p>returns the value of a ValueStreams' property.</p>
        <h2><code>set(name: string, value)</code></h2>
        <p>sets the value of a ValueStreams' property.There is also a custom setter function for each property:
           see <code>do</code> below. </p>
        <h3>
          implementation detail:
        </h3>
        <p>
          The ValueStream doesn't update necessarily after every <i>method</i> call.
          An update to the observed state that triggers an <code>subscribe(..)</code> after every actual
          <u>change of a property value</u>
          -- the effect of calling <code>myStream.set('propName', value)</code> directly or indirectly as
          <code>myStream.do.setPropName(value)</code>. So if your method doesn't change any value(s),
          it will not trigger an observable update. If it creates several value changes, it may trigger
          several. The point of transactional actions is to limit this side effect to a single update.
        </p>

        <h2><code>watch(name: string, onChange: fn, onError:fn, , onDone: fn): self</code></h2>
        <p>This special subscription focuses on change to a single value;
           onChange receives an object <code>{`{value, prev}`}</code> every time its value is changed.</p>
        <p>
          A variant of this  method, <code>{`watchFlat('name', (value, prev) => {...})`}</code>
           passes two arguments, the current and previous value, for each change.
        </p>

        <h2><code>emit(name: string, ...values)</code></h2>
        <p>
          emits a watchable event
        </p>

        <h2><code>on(name: string, listener: function|string(method name)) </code></h2>
        <p>
          Define a handler to handle an event
        </p>

        <h2><code>off(name: string, listener: function|string(method name)) </code></h2>
        <p>
          Define a handler to handle an event
        </p>

        <h2>ValueStream Properties</h2>
        <h2><code>value: Object</code></h2>
        <p>
          an object that has the properties' values reduced to an object. Note, relying on this property for routine
          access is less efficient than using <code>my</code> or <code>get('propertyName')</code>.
        </p>

        <h2><code>my: Object(Proxy)</code></h2>
        <p>
          my is a proxy object that enables quick access to the property values of a stream. See examples above.
          Unlike Value, pulling a single sub-property of the <code>my</code> property is much more efficient than
          doing the similar activity off the <code>values</code> property.
          It does depend on the Proxy javaScript class;
          if you need to be IE compliant, its best to use <code>myStream.get('propertyName')</code> calls instead.
        </p>
        <h2><code>do: Object</code></h2>
        <p>stream methods are accessed off the do property. For each property, say, <code>count</code>,
           a set method <code>stream.do.setCount(2)</code> is available from the do object.
        </p>
        <h3>Pro-tip: don't deconstruct properties/actions</h3>
        <p>As fun as es6 deconstruction is, streams are dynamic and can change values at any time.
           Deconstructing property/actions from streams may be easy but it leads to out-of-date references. Instead,
           use real time <code>get('propertyName')</code> calls or <code>myStream.do.myMethod()</code> calls.</p>
      </article>
    </main>
  </div>

}

export default Home
