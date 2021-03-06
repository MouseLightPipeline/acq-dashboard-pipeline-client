import {IPipelineStage} from "./pipelineStage";

export enum ProjectInputSourceState {
    Unknown = 0,
    BadLocation = 1,
    Missing = 2,
    Dashboard = 3,
    Pipeline = 4,
    Disappeared = 5
}

export interface IProject {
    id?: string;
    name?: string;
    description?: string;
    root_path?: string;
    log_root_path?: string;
    sample_number?: number;
    sample_x_min?: number;
    sample_x_max?: number;
    sample_y_min?: number;
    sample_y_max?: number;
    sample_z_min?: number;
    sample_z_max?: number;
    region_x_min?: number;
    region_x_max?: number;
    region_y_min?: number;
    region_y_max?: number;
    region_z_min?: number;
    region_z_max?: number;
    is_processing?: boolean;
    user_parameters?: string;
    zPlaneSkipIndices?: number[];
    input_source_state?: ProjectInputSourceState;
    last_seen_input_source?: Date;
    last_checked_input_source?: Date;
    stages?: IPipelineStage[];
    created_at?: number;
    updated_at?: number;
}

export interface IProjectGridRegion {
    x_min: number;
    x_max: number;
    y_min: number;
    y_max: number;
    z_min: number;
    z_max: number;
}

export interface IProjectInput {
    id?: string;
    name?: string;
    description?: string;
    root_path?: string;
    sample_number?: number;
    is_processing?: boolean;
    region_bounds?: IProjectGridRegion;
}


