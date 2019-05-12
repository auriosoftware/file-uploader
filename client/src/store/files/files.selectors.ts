import { RootState } from '../root.state';
import { createSelector } from 'reselect';
import { File } from './files.state';

export const filesByIdSelector = (state: RootState) => state.files.byId;

export const orderedFilesListSelector = createSelector([filesByIdSelector], (filesById) => {
    return Object.values(filesById).sort(fromNewest);
});

export function fromNewest(f1: File, f2: File) {
    return f2.startedAt.getTime() - f1.startedAt.getTime();
}
