import { RootState } from "../root.state";
import { createSelector } from "reselect";
import { File } from './files.state';

export const filesByIdSelector = (state: RootState) => state.files.byId;

export const orderedFilesListSelector = createSelector([filesByIdSelector], (filesById) => {
    return Object.values(filesById).sort(fromOldest)
});

export function fromOldest(f1: File, f2: File) {
    return f1.startedAt.getTime() - f2.startedAt.getTime();
}
