import * as React from "react";
import {Route, Redirect, Switch, NavLink} from "react-router-dom";
import {Container, Icon, Menu, List, Loader, Message, SemanticICONS} from "semantic-ui-react"
import {Query} from "react-apollo";
import {ToastContainer} from "react-toastify";

import {MenuLayout} from "./header/MenuLayout";

import {PipelineGraph} from "./graph/PipelineGraph";
import {WorkersPanel} from "./workers/WorkersPanel";
import {TasksPanel} from "./tasks/Tasks";
import {PipelineStages} from "./stages/PipelineStages";
import {Projects} from "./projects/Projects";
import {Dashboard} from "./Dashboard";
import {PreferencesManager} from "../util/preferencesManager";
import {TileMapPanel} from "./tilemap/Tilemaps";
import {IInternalApiDelegate, InternalApi, IServerConfigurationMessage} from "../api/internalApi/internalApi";
import {IRealTimeApiDelegate, RealTimeApi} from "../api/realTimeApi";
import {BaseQuery} from "../graphql/baseQuery";
import {IWorker} from "../models/worker";
import {ITaskDefinition} from "../models/taskDefinition";
import {ITaskRepository} from "../models/taskRepository";
import {IProject} from "../models/project";
import {IPipelineStage} from "../models/pipelineStage";

const toastStyleOverride = {
    minWidth: "600px",
    marginBottom: "40px"
};

const menuItems = [{
    path: "/",
    name: "Home",
    icon: "home"
}, {
    path: "/projects",
    name: "Projects",
    icon: "cube"
}, {
    path: "/graphs",
    name: "Project Graphs",
    icon: "sitemap"
}, {
    path: "/tilemaps",
    name: "Tile Maps",
    icon: "block layout"
}, {
    path: "/stages",
    name: "Stages",
    icon: "cubes"
}, {
    path: "/tasks",
    name: "Tasks",
    icon: "puzzle"
}, {
    path: "/workers",
    name: "Workers",
    icon: "server"
}];

interface IPageLayoutProps {
}

interface IPageLayoutState {
    buildVersion?: number;
    loadedBuildVersion?: number;
    processId?: number;
    isInternalApiConnected?: boolean;
    isSocketIoServerConnected?: boolean;
    isSidebarExpanded?: boolean;
    thumbsHostname?: string;
    thumbsPort?: number;
    thumbsPath?: string;
    isActivePipeline?: boolean;
    socketIoPortOffset?: number;
}

export class PageLayout extends React.Component<IPageLayoutProps, IPageLayoutState> implements IInternalApiDelegate, IRealTimeApiDelegate {
    private readonly _internalApi: InternalApi = null;
    private readonly _realTimeApi: RealTimeApi = null;

    public constructor(props) {
        super(props);

        this.state = {
            buildVersion: null,
            loadedBuildVersion: null,
            processId: null,
            isInternalApiConnected: false,
            isSocketIoServerConnected: false,
            isSidebarExpanded: !PreferencesManager.Instance.IsSidebarCollapsed,
            thumbsHostname: "",
            thumbsPort: 80,
            thumbsPath: "/thumbnail",
            isActivePipeline: true,
            socketIoPortOffset: 0
        };

        this._internalApi = new InternalApi(this);
        this._realTimeApi = new RealTimeApi(this);
    }

    public async componentDidMount() {
        this._internalApi.start();
    }

    public componentWillUnmount() {
        if (this._realTimeApi !== null) {
            this._realTimeApi.close();
        }
    }

    private onToggleSidebar() {
        PreferencesManager.Instance.IsSidebarCollapsed = this.state.isSidebarExpanded;
        this.setState({isSidebarExpanded: !this.state.isSidebarExpanded});
    }

    public render() {
        if (!this.state.isInternalApiConnected) {
            return (
                <Message warning style={{margin: "20px"}}>The server is not responding. The service may be down.
                    Will continue to retry the connection.</Message>);
        }

        if (!this.state.isSocketIoServerConnected) {
            return (
                <Message style={{margin: "20px"}}>Establishing connection...</Message>);
        }

        const width = this.state.isSidebarExpanded ? 199 : 79;
        const icon = this.state.isSidebarExpanded ? "labeled" : true;

        const menus = menuItems.map(m => {
            return (
                <Menu.Item as={NavLink} exact to={m.path} name={m.name} key={m.name}>
                    <Icon name={m.icon as SemanticICONS}/>
                    {this.state.isSidebarExpanded ? m.name : null}
                </Menu.Item>
            );
        });

        return (
            <Query query={BaseQuery} pollInterval={15000}>
                {
                    ({loading, error, data}) => {
                        if (error) {
                            return (<span>{error.message}</span>);
                        }

                        if (loading || !data) {
                            return (
                                <div style={{display: "flex", height: "100%", alignItems: "center"}}>
                                    <Loader active inline="centered">Loading</Loader>
                                </div>
                            );
                        }

                        const workerMap = new Map<string, IWorker>();
                        data.pipelineWorkers.map(w => workerMap.set(w.id, w));

                        return (
                            <div style={{height: "100%"}}>
                                <ToastContainer autoClose={6000} position="bottom-center" style={toastStyleOverride}/>
                                <MenuLayout projects={data.projects} workers={data.pipelineWorkers}
                                            isActivePipeline={this.state.isActivePipeline}
                                            isSidebarExpanded={this.state.isSidebarExpanded}
                                            schedulerHealth={data.schedulerHealth}
                                            onToggleSidebar={() => this.onToggleSidebar()}/>
                                <div style={{
                                    display: "flex",
                                    minHeight: "calc(100% - 62px)",
                                    margin: 0,
                                    overflow: "hidden",

                                }}>
                                    <Menu vertical inverted icon={icon} fixed="left"
                                          style={{
                                              order: 0,
                                              flex: "0 0 auto",
                                              width: width + "px",
                                              minHeight: "100%",
                                              transition: "all 0.3s ease",
                                              marginTop: "62px"
                                          }}>
                                        {menus}
                                        <Menu.Item>
                                            {this.state.isSidebarExpanded ?
                                                <List divided={false} size="tiny" style={{padding: "0px"}}>
                                                    <List.Item>Version: {this.state.buildVersion}</List.Item>
                                                    <List.Item>PID: {this.state.processId}</List.Item>
                                                </List> : null}
                                        </Menu.Item>
                                    </Menu>

                                    <Container
                                        style={{
                                            order: 1,
                                            flex: "1 1 auto",
                                            backgroundColor: "rgb(244, 247, 250)",
                                            width: "100%",
                                            transition: "all 0.3s ease",
                                            paddingLeft: this.state.isSidebarExpanded ? "200px" : "80px",
                                            paddingTop: "62px"
                                        }}>
                                        <Switch>
                                            <Route path="/" exact
                                                   render={() => this.dashboard(data.projects, data.pipelineWorkers)}/>
                                            <Route path="/projects" render={() => this.projects(data.projects)}/>
                                            <Route path="/graphs" render={() => this.pipelineGraphs(data.projects)}/>
                                            <Route path="/tilemaps" render={() => this.tileMaps(data.projects)}/>
                                            <Route path="/stages"
                                                   render={() => this.pipelineStages(data.projects, data.pipelineStages, data.taskDefinitions, workerMap)}/>
                                            <Route path="/tasks"
                                                   render={() => this.tasks(data.taskRepositories, data.taskDefinitions, data.pipelineVolume)}/>
                                            <Route path="/workers" render={() => this.workers(data.pipelineWorkers)}/>
                                            <Redirect to="/"/>
                                        </Switch>
                                    </Container>
                                </div>
                            </div>
                        );
                    }
                }
            </Query>
        )
    }

    public onServiceConnectionStateChanged(isConnected: boolean) {
        if (isConnected) {
            this._internalApi.start();
            this.setState({isSocketIoServerConnected: true});
        } else {
            this._internalApi.kill();
            this.setState({isSocketIoServerConnected: false, isInternalApiConnected: false});
        }
    }

    public onServerConfiguration(message: IServerConfigurationMessage) {
        this.setState({
            buildVersion: message.buildVersion,
            processId: message.processId,
            thumbsHostname: message.thumbsHostname,
            thumbsPort: message.thumbsPort,
            thumbsPath: message.thumbsPath,
            isActivePipeline: message.isActivePipeline,
            socketIoPortOffset: message.socketIoPortOffset
        });

        // If this is the first request then it is the version we loaded.  If not, the backend may have restarted
        // with a new version and we
        if (!this.state.loadedBuildVersion) {
            this.setState({loadedBuildVersion: message.buildVersion});
        }

        this.setState({isInternalApiConnected: true});

        this._realTimeApi.connect(message.socketIoPortOffset).then();
    }

    private dashboard = (projects: IProject[], workers: IWorker[]) => (
        <Dashboard projects={projects} workers={workers}/>
    );

    private projects = (projects: IProject[]) => (
        <Projects projects={projects}/>
    );

    private pipelineGraphs = (projects: IProject[]) => (
        <PipelineGraph projects={projects}/>
    );

    private tileMaps = (projects: IProject[]) => (
        <TileMapPanel projects={projects} thumbsHostname={this.state.thumbsHostname} thumbsPort={this.state.thumbsPort}
                      thumbsPath={this.state.thumbsPath}/>
    );

    private pipelineStages = (projects: IProject[], pipelineStages: IPipelineStage[], taskDefinitions: ITaskDefinition[], workerMap: Map<string, IWorker>) => (
        <PipelineStages projects={projects} pipelineStages={pipelineStages} taskDefinitions={taskDefinitions}
                        workerMap={workerMap}/>
    );

    private tasks = (taskRepositories: ITaskRepository[], taskDefinitions: ITaskDefinition[], pipelineVolume: string) => (
        <TasksPanel taskDefinitions={taskDefinitions} taskRepositories={taskRepositories}
                    pipelineVolume={pipelineVolume}/>
    );

    private workers = (workers: IWorker[]) => (
        <WorkersPanel workers={workers}/>
    );
}
