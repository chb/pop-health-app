export * from "react-redux"


declare global {
    interface Window {
        jQuery: any;
        Highcharts: any;
        require: any;
    }
}

declare module "react-redux" {

    interface AuthState {
        currentUser: any;
        loading: boolean;
    }

    interface DataSourcesState {}
    interface OrganizationsState {}
    interface PayersState {}
    interface MeasuresState {}
    interface UiState {}

    interface MeasureResultsState {
        data: any[];
        loading: boolean;
        error: Error | null;
    }

    interface DefaultRootState {
        dataSources: DataSourcesState;
        organizations: OrganizationsState;
        auth: AuthState;
        payers: PayersState;
        measures: MeasuresState;
        measureResults: MeasureResultsState;
        ui: UiState;
    }
}
