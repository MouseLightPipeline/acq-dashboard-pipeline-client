import gql from "graphql-tag";

export const TaskQuery = gql`query {
  taskRepositories {
    id
    name
    description
    location
    task_definitions {
      id
      name
      description
      pipeline_stages {
        id
        name
      }
    }
  }
  taskDefinitions {
    id
    name
    description
    script
    interpreter
    work_units
    args
    script_status
    task_repository {
      id
      name
      description
      location
    }
    pipeline_stages {
      id
      name
    }
  }
}`;

export const CreateTaskDefinitionMutation = gql`mutation CreateTaskDefinition($taskDefinition: TaskDefinitionInput) {
    createTaskDefinition(taskDefinition: $taskDefinition) {
        taskDefinition {
            id
            name
            description
            script
            interpreter
            args
            work_units
            task_repository {
              id
              name
            }
            created_at
            updated_at
        }   
        error
    }
}`;

export const UpdateTaskDefinitionMutation = gql`mutation UpdateTaskDefinition($taskDefinition: TaskDefinitionInput) {
    updateTaskDefinition(taskDefinition: $taskDefinition) {
        taskDefinition {
            id
            name
            description
            script
            interpreter
            args
            work_units
            task_repository {
              id
              name
            }
            created_at
            updated_at
        }   
        error
    }
}`;

export const DeleteTaskDefinitionMutation = gql`mutation DeleteTaskDefinition($taskDefinition: TaskDefinitionInput) {
    deleteTaskDefinition(taskDefinition: $taskDefinition) {
        id
        error
    }
}`;

export const ScriptContentsQuery = gql`query ScriptContents($task_definition_id: String) {
    scriptContents(task_definition_id: $task_definition_id)
}`;