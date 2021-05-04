"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendNewUserEmail = sendNewUserEmail;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _nodemailer = _interopRequireDefault(require("nodemailer"));

var _logger = _interopRequireDefault(require("./logger"));

var _db = require("./db");

var db = new _db.Database();
/**
 * Send an email if the app is configured to talk to a SMTP server. 
 * @param {*} to 
 * @param {*} subject 
 * @param {*} body 
 * @returns 
 */

function sendEmail(_x, _x2, _x3) {
  return _sendEmail.apply(this, arguments);
}
/**
 * Send all the admins an email.
 * @param {*} subject 
 * @param {*} body 
 */


function _sendEmail() {
  _sendEmail = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(to, subject, body) {
    var settings, transporter, info;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return db.getSettings();

          case 2:
            settings = _context.sent;

            if (settings.emailHost && settings.emailPort && settings.emailPort && settings.emailUser && settings.emailPassword) {
              _context.next = 6;
              break;
            }

            _logger["default"].warn('Email SMTP server not configured.');

            return _context.abrupt("return");

          case 6:
            transporter = _nodemailer["default"].createTransport({
              host: settings.emailHost,
              port: settings.emailPort,
              secure: settings.emailPort == 465 ? true : false,
              auth: {
                user: settings.emailUser,
                pass: settings.emailPassword
              }
            });
            _context.next = 9;
            return transporter.sendMail({
              from: settings.emailFromAddress,
              to: to,
              subject: subject,
              text: body
            });

          case 9:
            info = _context.sent;

            _logger["default"].info("Email sent to=".concat(to, " subject=").concat(subject, " messageId=").concat(info.messageId));

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _sendEmail.apply(this, arguments);
}

function sendAdminsEmail(_x4, _x5) {
  return _sendAdminsEmail.apply(this, arguments);
}
/**
 * Send an email to admins about a new user login. 
 * @param {models.User} user 
 */


function _sendAdminsEmail() {
  _sendAdminsEmail = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(subject, body) {
    var admins, emails, to;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return db.getAdminUsers();

          case 2:
            admins = _context2.sent;
            emails = admins.map(function (u) {
              return u.email;
            }).filter(function (u) {
              return u !== null;
            });

            if (!(emails.length > 0)) {
              _context2.next = 10;
              break;
            }

            to = emails.join(',');
            _context2.next = 8;
            return sendEmail(to, subject, body);

          case 8:
            _context2.next = 11;
            break;

          case 10:
            _logger["default"].info("no admin email configured for new user email");

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _sendAdminsEmail.apply(this, arguments);
}

function sendNewUserEmail(_x6) {
  return _sendNewUserEmail.apply(this, arguments);
}

function _sendNewUserEmail() {
  _sendNewUserEmail = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(user) {
    var body;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            body = "\nA new user signed into your DocNow instance.\n\nName: ".concat(user.name, "\nTwitter: https://twitter.com/").concat(user.twitterScreenName, "\n\nFor them to to start using the application you will need to activate their account.\n");
            _context3.next = 3;
            return sendAdminsEmail("New DocNow user: ".concat(user.twitterScreenName), body);

          case 3:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _sendNewUserEmail.apply(this, arguments);
}