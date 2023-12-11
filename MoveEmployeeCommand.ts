import { Employee } from "./EmployeeOrgApp";

export interface ICommand {
  execute(): void;
  undo(): void;
}

export class MoveEmployeeCommand implements ICommand {
  private employeeToMove!: Employee;
  private oldSupervisor!: Employee;
  private newSupervisor!: Employee;
  private employeeSubordinates: Employee[] = [];

  constructor(
    private organizationRoot: Employee,
    private employeeIdToMove: number,
    private newSupervisorId: number
  ) {}

  execute(): void {
    const employeeToMove = this.findEmployeeById(this.organizationRoot, this.employeeIdToMove);
    if (!employeeToMove) {
      console.error(`Employee with ID ${this.employeeIdToMove} not found.`);
      return;
    }

    this.employeeToMove = employeeToMove;

    const oldSupervisor = this.findSupervisorOfEmployee(this.organizationRoot, this.employeeToMove);
    if (!oldSupervisor) {
      console.error("Cannot move CEO.");
      return;
    }

    this.oldSupervisor = oldSupervisor;

    const newSupervisor = this.findEmployeeById(this.organizationRoot, this.newSupervisorId);
    if (!newSupervisor) {
      console.error(`New supervisor with ID ${this.newSupervisorId} not found.`);
      return;
    }

    this.newSupervisor = newSupervisor;

    // Move the employee
    this.oldSupervisor.subordinates = this.oldSupervisor.subordinates.filter(
      (e) => e.uniqueId !== this.employeeToMove.uniqueId
    );

    this.employeeSubordinates = this.employeeToMove.subordinates;
    this.oldSupervisor.subordinates = [...this.oldSupervisor.subordinates, ...this.employeeSubordinates];

    this.newSupervisor.subordinates.push({
      ...this.employeeToMove,
      subordinates: [],
    });
  }

  undo(): void {
    // Undo the move operation
    this.newSupervisor.subordinates = this.newSupervisor.subordinates.filter(
      (e) => e.uniqueId !== this.employeeToMove.uniqueId
    );

    const employeeSubordinatesIds = this.employeeSubordinates.map((e) => e.uniqueId);
    this.oldSupervisor.subordinates = this.oldSupervisor.subordinates.filter(
      (e) => !employeeSubordinatesIds.includes(e.uniqueId)
    );

    // Not require keeping the order of employees in old Supervisor's subordinates array
    this.oldSupervisor.subordinates.push({
      ...this.employeeToMove,
      subordinates: [...this.employeeSubordinates],
    });
  }

  private findEmployeeById(root: Employee, id: number): Employee | undefined {
    if (root.uniqueId === id) {
      return root;
    }

    for (const subordinate of root.subordinates) {
      const result = this.findEmployeeById(subordinate, id);
      if (result) {
        return result;
      }
    }

    return undefined;
  }

  private findSupervisorOfEmployee(root: Employee, employee: Employee): Employee | undefined {
    for (const subordinate of root.subordinates) {
      if (subordinate.subordinates.some((e) => e.uniqueId === employee.uniqueId)) {
        return subordinate;
      }

      const result = this.findSupervisorOfEmployee(subordinate, employee);
      if (result) {
        return result;
      }
    }

    return undefined;
  }
}
