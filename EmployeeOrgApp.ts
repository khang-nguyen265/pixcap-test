import { ICommand, MoveEmployeeCommand } from "./MoveEmployeeCommand";

export interface Employee {
  uniqueId: number;
  name: string;
  subordinates: Employee[];
}

export interface IEmployeeOrgApp {
  ceo: Employee;
  moveEmployee(employeeID: number, supervisorID: number): void;
  undo(): void;
  redo(): void;
}

export class EmployeeOrgApp implements IEmployeeOrgApp {
  ceo: Employee;
  private commandStack: ICommand[] = [];
  private redoStack: ICommand[] = [];

  constructor(ceo: Employee) {
    this.ceo = ceo;
  }

  moveEmployee(employeeID: number, supervisorID: number): void {
    const command = new MoveEmployeeCommand(this.ceo, employeeID, supervisorID);
    command.execute();
    this.commandStack.push(command);
    // Clear redo stack after a new move
    this.redoStack = []; 
  }

  undo(): void {
    if (this.commandStack.length > 0) {
      const command = this.commandStack.pop();
      command?.undo();
      this.redoStack.push(command!);
    }
  }

  redo(): void {
    if (this.redoStack.length > 0) {
      const command = this.redoStack.pop();
      command?.execute();
      this.commandStack.push(command!);
    }
  }
}


