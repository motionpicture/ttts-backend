/**
 * devルーター
 *
 * @ignore
 */

import * as express from 'express';
const router = express.Router();

import * as createDebug from 'debug';
import { NO_CONTENT } from 'http-status';
import * as mongoose from 'mongoose';

import mongooseConnectionOptions from '../../mongooseConnectionOptions';

const debug = createDebug('ttts-backend:routers:dev');

router.get(
    '/400',
    () => {
        throw new Error('400 manually');
    }
);

router.get(
    '/environmentVariables',
    (__, res) => {
        res.json({
            data: {
                type: 'envs',
                attributes: process.env
            }
        });
    }
);

router.get(
    '/mongoose/connect',
    (__, res, next) => {
        debug('connecting...');
        mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions, (err) => {
            if (err instanceof Error) {
                next(err);
                return;
            }

            res.status(NO_CONTENT).end();
        });
    }
);

router.get(
    '/mongoose/disconnect',
    (__, res, next) => {
        debug('disconnecting...');
        mongoose.disconnect((err) => {
            if (err instanceof Error) {
                next(err);
                return;
            }

            res.status(NO_CONTENT).end();
        });
    }
);

export default router;
