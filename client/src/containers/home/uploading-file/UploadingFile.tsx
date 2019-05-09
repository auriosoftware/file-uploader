import React, {Ref} from 'react';
import {connect} from "react-redux";
import style from './UploadingFile.module.scss';
import {UploadingFilesActions} from "../../../reducers/uploading-files/uploading-files.actions";
import {RootState, UploadingFile} from "../../../reducers/root.state";
import {LinearProgress} from "@material-ui/core";

export interface PropsFromStore {
}

function mapStateToProps(state: RootState): PropsFromStore {
    return {
    };
}

export interface PropsFromDispatch {
}

function mapDispatchToProps(dispatch: any): PropsFromDispatch {
    return {
    };
}

type Props = {
    uploadingFile: UploadingFile
} & PropsFromDispatch & PropsFromStore;

const Component: React.FC<Props> = (props) => {
    return (
        <div className={style.container}>
            {props.uploadingFile.name}
            <LinearProgress variant="determinate" value={props.uploadingFile.progress} />
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);
