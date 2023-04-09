import rimraf from 'rimraf';
import process from 'process';
import webpackPaths from '../configs/webpack.paths';

const foldersToRemove = [
  webpackPaths.webPath
];

foldersToRemove.forEach((folder) => {
  rimraf.sync(folder);
});
