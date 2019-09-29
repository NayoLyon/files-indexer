# files-indexer
Desktop application to index files and manage duplicate files.

This application uses Electron, React, React Router, Webpack, React Hot Loader, ...

This application has been initialized with https://github.com/chentsulin/electron-react-boilerplate

TODO:
- Hints for table pagination, see https://stackoverflow.com/questions/17067294/html-table-with-100-width-with-vertical-scroll-inside-tbody ?? or https://react-table.js.org/#/story/simple-table (https://www.npmjs.com/package/react-table) or https://datatables.net/examples/styling/semanticui https://datatables.net/download/npm
- do not consider files times (modified, created...) different if the difference is a matter of seconds ??
- alternative to NeDB: https://github.com/nylas/electron-RxDB
- remove all static methods from api/database.
- Remove path and folder from db (for space, useless)


- NewFiles tab: Copy to database (and choose folder => rescan on all files not linked to a dbFile's hash (duplicates and new files)). Checkbox to multiple select to move several files in a row to a folder in db (choose folder + allow to create new folders).
- actions in modal (rename, modify attributes, copy??or delete from db)
- change db and folder labels to the names of the folders
- move to TableContainer for the management of all lists: DuplicateTab, MissingTab, IndexationAnomaliesView, ResultTabDuplicateView, ResultTabIdenticalView, ResultTabNewView
- change printValue to a ValueRenderer

- fix the copyModifiedAttributeTo: when file is modified, re-index (to be sure), then relaunch scan for this dbFile and the scan file...
- for copy of files in the db, we may need to relaunch a full rescan...
- Files are duplicated between the 5th tab and the tab where each file is. Do not display them anymore in the tab ?
- Bug on full re-indexation: the removed files are not removed... We should remove the entire database (rename the file to .bak ?)...
- fix the analyse: it is not async, so the progress is never displayed...
- Add cancel/stop to indexing, scanning, analysing...
- Fix fileProps seams to be saved in db (matches field in db...)???
- fix on re-indexation: the content is not scrollable, so we do not have the all list of elements updated...
