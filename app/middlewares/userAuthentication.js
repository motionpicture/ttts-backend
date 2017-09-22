"use strict";
/**
 * ユーザー認証ミドルウェア
 *
 * @module middlewares/userAuthentication
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ttts_domain_1 = require("@motionpicture/ttts-domain");
const createDebug = require("debug");
const Message = require("../../common/Const/Message");
const masterAdmin_1 = require("../models/user/masterAdmin");
const debug = createDebug('ttts-backend:middlewares:userAuthentication');
const cookieName = 'remember_master_admin';
exports.default = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    res.locals.req = req;
    req.staffUser = masterAdmin_1.default.PARSE(req.session);
    debug('req.staffUser:', req.staffUser);
    res.locals.loginName = (req.staffUser && req.staffUser.name && req.staffUser.name.ja) ? req.staffUser.name.ja : '';
    if (req.staffUser === undefined) {
        next(new Error(Message.Common.unexpectedError));
        return;
    }
    // 既ログインの場合
    if (req.staffUser.isAuthenticated()) {
        next();
        return;
    }
    // 自動ログインチェック
    if (req.cookies[cookieName] !== undefined) {
        try {
            const authenticationDoc = yield ttts_domain_1.Models.Authentication.findOne({
                token: req.cookies[cookieName],
                owner: { $ne: null }
            }).exec();
            if (authenticationDoc === null) {
                res.clearCookie(cookieName);
            }
            else {
                // トークン再生成
                const token = ttts_domain_1.CommonUtil.createToken();
                yield authenticationDoc.update({ token: token }).exec();
                // tslint:disable-next-line:no-cookies
                res.cookie(cookieName, token, { path: '/', httpOnly: true, maxAge: 604800000 });
                const owner = yield ttts_domain_1.Models.Owner.findOne({ _id: authenticationDoc.get('owner') }).exec();
                // ログインしてリダイレクト
                if (owner !== null) {
                    req.session[masterAdmin_1.default.AUTH_SESSION_NAME] = owner.toObject();
                }
                res.redirect(req.originalUrl);
                return;
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    if (req.xhr) {
        res.json({
            success: false,
            message: 'login required'
        });
    }
    else {
        res.redirect(`/master/login?cb=${req.originalUrl}`);
    }
});
