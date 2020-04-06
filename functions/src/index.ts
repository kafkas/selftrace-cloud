import { clusterRequestHandler, clusterRequestHandlerOptimized } from './clusters';
import { userCreationHandler, userDeletionHandler, userUpdateHandler } from './users';
import { migrationHandler } from './migrate';

/* Users */
exports.processUserCreation = userCreationHandler;
exports.processUserDeletion = userDeletionHandler;
exports.processUserUpdate = userUpdateHandler;

/* Clusters */
exports.processClusterRequest = clusterRequestHandler;
exports.processClusterRequestOptimized = clusterRequestHandlerOptimized;

/* Migration */
exports.migrate = migrationHandler;
