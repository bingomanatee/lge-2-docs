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
      fakeServer.testDatabase.set(testName + "\t" + student, {...test, name: testName}); // tests are stored by pseudo key
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

/**
 * note - addTestsToStudent is transactionally locked to reduce noise from the many sub-calls of testToStudent.
 * updateStudentGrades is likewise transactionally locked.
 * This minimizes the churn of computeTestGrades, but the two async actions,
 * submitTests and updateStudentsGrades,
 * are both exeucting outside of transactional locking so anything that happens when the (fake) server is
 * churning on data doesn't block the stream from updates.
 */

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
