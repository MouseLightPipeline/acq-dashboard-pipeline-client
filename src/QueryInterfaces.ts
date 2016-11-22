export interface IProject {
    id: string;
    name: string;
    description: string;
    root_path: string;
    sample_number: number,
    is_active: boolean;
}

export interface IPipelineStage {
    id: string;
    name: string;
    description: string;
    project_id: string;
    task_id: string;
    previous_stage_id: string;
    src_path: string;
    dst_path: string;
    is_active: boolean;
    function_type: number;
    execution_order: number;
}

export interface IWorker {
    id: string;
    name: string;
    description: string;
    machine_id: string;
    last_seen: string;
    status: number;
}

export interface ITaskDefinition {
    id: string;
    name: string;
    script: string;
    interpreter: string;
    description: string;
}
