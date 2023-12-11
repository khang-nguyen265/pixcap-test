import { EmployeeOrgApp, Employee } from './EmployeeOrgApp';

describe('EmployeeOrgApp', () => {
  let ceo: Employee;
  let app: EmployeeOrgApp;

  beforeEach(() => {
    // Set up the initial state before each test
    ceo = {
      uniqueId: 1,
      name: 'Mark Zuckerberg',
      subordinates: [
        {
          uniqueId: 2,
          name: 'Sarah Donald',
          subordinates: [
            {
              uniqueId: 3,
              name: 'Cassandra Reynolds',
              subordinates: [
                {
                  uniqueId: 4,
                  name: 'Mary Blue',
                  subordinates: [],
                },
                {
                  uniqueId: 5,
                  name: 'Bob Saget',
                  subordinates: [
                    {
                      uniqueId: 6,
                      name: 'Tina Teff',
                      subordinates: [
                        {
                          uniqueId: 7,
                          name: 'Will Turner',
                          subordinates: [],
                        }
                      ],
                    }
                  ],
                },
              ],
            },
          ],
        },
        {
          uniqueId: 10,
          name: 'Tyler Simpson',
          subordinates: [],
        },
        {
          uniqueId: 11,
          name: 'Bruce Willis',
          subordinates: [],
        },
        {
          uniqueId: 12,
          name: 'Georgina Flangy',
          subordinates: [
            {
              uniqueId: 13,
              name: 'Sophie Turner',
              subordinates: [],
            },
          ],
        },
      ],
    };

    app = new EmployeeOrgApp(ceo);
  });

  test('Move employee to a new supervisor', () => {

    app.moveEmployee(5, 12);

    // Georgina is now the supervisor of Bob
    expect(app.ceo.subordinates[3].subordinates.map(e => e?.uniqueId)).toContain(5); 
    // Tina is subordinates of Cassandra
     expect(app.ceo.subordinates[0].subordinates[0].subordinates.map(e => e.uniqueId)).toContain(6)
  });

  test('Undo move employee', () => {
    // Move Bod to new supervisor Georgina
    app.moveEmployee(5, 12);

    app.undo();

    // Bob is back to Cassandra's subordinates
    expect(app.ceo.subordinates[0].subordinates[0].subordinates.map(e => e?.uniqueId)).toContain(5);
    // Georgina no longer supervises Bob
    expect(ceo.subordinates[3].subordinates.map(e => e?.uniqueId)).not.toContain(5); 

    // Bob is back to Cassandra's subordinates
    expect(app.ceo.subordinates[0].subordinates[0].subordinates.map(e => e?.uniqueId)).toContain(5);
  });

  test('Redo move employee', () => {
    // Move Bod to new supervisor Georgina
    app.moveEmployee(5, 12);

    app.undo();
    app.redo();
    // Assert the state after redoing the move
    // Cassandra no longer supervises Bob
    expect(app.ceo.subordinates[0].subordinates[0].subordinates.map(e => e?.uniqueId)).not.toContain(5);
    // Georgina is now the supervisor of Bob again
    expect(app.ceo.subordinates[3].subordinates.map(e => e?.uniqueId)).toContain(5); 
  });

  test('Undo multiple times', () => {
    // Move Bod to new supervisor Georgina
    app.moveEmployee(5, 12);
    // Move Sophie Turner to new supervisor Bruce Willis
    app.moveEmployee(13, 11)
    app.undo();
    app.undo();

    // Bob is back to Cassandra's subordinates
    expect(app.ceo.subordinates[0].subordinates[0].subordinates.map(e => e?.uniqueId)).toContain(5);
    // Georgina no longer supervises Bob
    expect(ceo.subordinates[3].subordinates.map(e => e?.uniqueId)).not.toContain(5); 

    // Sophie no longer supervises Bruce
    expect(app.ceo.subordinates[2].subordinates.map(e => e?.uniqueId)).not.toContain(13);
    // Georgina is now the supervisor of Sophie again
    expect(app.ceo.subordinates[3].subordinates.map(e => e?.uniqueId)).toContain(13); 
  });

  test('Redo multiple times', () => {
    // Move Bod to new supervisor Georgina
    app.moveEmployee(5, 12);
    // Move Sophie Turner to new supervisor Bruce Willis
    app.moveEmployee(13, 11)
    app.undo();
    app.undo();
    app.redo();
    app.redo();


    // Cassandra no longer supervises Bob
    expect(app.ceo.subordinates[0].subordinates[0].subordinates.map(e => e?.uniqueId)).not.toContain(5);
    // Georgina is now the supervisor of Bob 
    expect(app.ceo.subordinates[3].subordinates.map(e => e?.uniqueId)).toContain(5); 

    // Georgina no longer supervises Sophie
    expect(app.ceo.subordinates[3].subordinates.map(e => e?.uniqueId)).not.toContain(13);
    // Bruce is now the supervisor of Sophie
    expect(app.ceo.subordinates[2].subordinates.map(e => e?.uniqueId)).toContain(13); 
  });


  test('Should not move employee if either employeeId or supervisorId is not valid', () => {
     
     const initialTree = JSON.stringify(app.ceo);

     // Attempt to move with invalid employeeId
     app.moveEmployee(999, 6);
     const updatedTreeAfterInvalidEmployeeId = JSON.stringify(app.ceo);
     expect(updatedTreeAfterInvalidEmployeeId).toEqual(initialTree); 
 
      // Attempt to move with invalid supervisorId
      app.moveEmployee(3, 999); 
      const updatedTreeAfterInvalidSupervisorId = JSON.stringify(app.ceo);
      expect(updatedTreeAfterInvalidSupervisorId).toEqual(initialTree);
  }); 

  test('Can\'t move if the employee is the CEO', () => {
    const initialTree = JSON.stringify(app.ceo);
    app.moveEmployee(1, 3);

    const updatedTree = JSON.stringify(app.ceo);
    expect(updatedTree).toEqual(initialTree);
  }); 

  test('The move is successful when A is directly supervised by B', () => {
    // Move Bod to Tina
    app.moveEmployee(5, 6);
    // Tina is now the supervisor of Bob
    expect(app.ceo.subordinates[0].subordinates[0].subordinates.find(e => e.uniqueId === 6)?.subordinates.map(e => e?.uniqueId)).toContain(5); 
  }); 

 test('Move employee to the same supervisor (invalid move)', () => {
  // Move Bod to Cassandra
  app.moveEmployee(5, 3);

  // Assert that the move did not change the state
  // Cassandra still supervises Bob
  expect(app.ceo.subordinates[0].subordinates[0].subordinates.map(e => e?.uniqueId)).toContain(5); 

  });
});

