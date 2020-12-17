"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ValidateMe = /*#__PURE__*/function () {
  function ValidateMe(scope) {
    _classCallCheck(this, ValidateMe);

    this.form = scope;
    this.fields = [];
  }

  _createClass(ValidateMe, [{
    key: "addField",
    value: function addField(options) {
      var field = $.extend({}, this.baseFieldAttr, options);
      field.$el = this.form.$el.find('[name="' + field.name + '"]');
      if (!this.isValidOptions(field) || !!this.getField(field.name)) return;
      field.id = field.$el.attr('id') || null;
      field.placeholder = field.$el.attr('placeholder') || null;

      if (!field.type) {
        var tag = field.$el.prop("tagName").toLowerCase();
        field.type = tag === "input" ? field.$el.prop("type").toLowerCase() : tag;

        if (field.type === 'select') {
          field.defaultValue = field.$el.find('[default]').length > 0 ? field.$el.find('[default]') : field.$el.find('option').eq(0);
        }
      }

      field.$copy = field.copy ? this.form.$el.find('[name="' + field.copy + '"]') : null;
      field.regex = !!field.regex ? field.regex : !!this.customFieldType[field.type] ? this.customFieldType[field.type].regex : null;
      this.fields.push(field);
    }
  }, {
    key: "removeField",
    value: function removeField(name) {
      var field = this.getField(name);

      if (field) {
        this.fields.splice(this.fields.indexOf(field), 1);
      }
    }
  }, {
    key: "getField",
    value: function getField(name) {
      return this.fields.find(function (el) {
        return el.name === name;
      });
    }
  }, {
    key: "validate",
    value: function validate() {
      this.invalidFields = [];

      var _iterator = _createForOfIteratorHelper(this.fields),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var field = _step.value;
          var fieldValid = !!this.validations["default"](field);

          if (fieldValid) {
            if (!!this.validations[field.type]) {
              fieldValid = !!this.validations[field.type](field);

              if (fieldValid && !!field.validation) {
                fieldValid = !!field.validation(field);
              }
            }
          }

          if (!fieldValid) {
            this.invalidFields.push(field);
          }

          if (field.type === 'file') {
            field.value = field.$el.files;
          } else {
            field.value = field.$el.val();
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      if (this.hasError) {
        this.form.onValidationError(this.fields, this.invalidFields);
      } else {
        if (!!this.form.$el.attr('ajax')) {
          this.form.onValidationSuccess(this.fields);
        }
      }

      return !this.hasError;
    } // @TODO Add option to change option via function.

  }, {
    key: "isValidOptions",
    value: function isValidOptions(field) {
      var isValid = true;

      if (field.$el.length === 0) {
        isValid = false;
        console.error("Couldn't find field with associated name :: ".concat(field.name));
      }

      if (field.type) {
        if (!Object.keys(this.customFieldType).includes(field.type)) {
          isValid = false;
          console.warn("The type you want for the ".concat(field.name, " field is not supported so it will be validate as a text field. Please refer to documentation."));
        }
      }

      if (field.required && typeof field.required !== "boolean") {
        isValid = false;
        console.error("Parammeter 'required' of ".concat(field.name, " the field must be boolean."));
      }

      if (field.copy && this.form.$el.find('[name="' + field.copy + '"]').length < 1) {
        isValid = false;
        console.error("Couldn't find field that need to have the same value with associated name :: ".concat(field.name));
      }

      if (field.regex && !(field.regex instanceof RegExp)) {
        isValid = false;
        console.error("RegExp on ".concat(field.name, " field is not valid."));
      }

      if (field.filesize && typeof field.filesize !== "number") {
        isValid = false;
        console.error("Filesize must be a Number.");
      }

      if (field.placeholder && typeof field.placeholder !== "string") {
        isValid = false;
        console.error("Placeholder must be String.");
      }

      if (field.validation && typeof field.validation !== "function") {
        isValid = false;
        console.error("Validation must be function.");
      }

      return isValid;
    }
  }, {
    key: "reset",
    value: function reset() {
      $.each(this.fields, function (index, field) {
        if (field.type === 'checkbox' || field.type === 'radio') {
          field.$el.attr('checked', false);
        } else if (field.type === 'select') {
          field.$el.val(field.defaultValue.val());
        } else {
          field.$el.val('');
        }

        field.$el.trigger('change');
      });
    }
  }, {
    key: "form",
    set: function set(scope) {
      this._form = scope;
    },
    get: function get() {
      return this._form;
    }
  }, {
    key: "invalidFields",
    set: function set(arr) {
      if (_typeof(arr) !== 'object') {
        console.error('The arr parameter must be an array');
        return;
      }

      this._invalidFields = arr;
    },
    get: function get() {
      return this._invalidFields;
    }
  }, {
    key: "baseFieldAttr",
    get: function get() {
      return {
        name: null,
        // REQUIRED, String: name attribute of the field.
        type: null,
        // String, must be one of the types in customFieldType.
        error_code: null,
        // copy, empty, regex
        required: true,
        // Boolean: the non-required fields will be validated (only if they are not empty), which let the user the chocie to leave it empty or not.
        copy: null,
        // String: Name of the field element who should have the same value.
        regex: null,
        // Regular Expression
        placeholder: null,
        // String
        validation: null,
        // Functions
        //Select options
        default_ok: false,
        // Bool, if the default option of the select can be a valid option to submit
        //File options
        file_size: null,
        // Number: filesize allowed in kb
        file_type: null // Array: types allowed. Exemple: ['.png', '.jpg']

      };
    }
  }, {
    key: "customFieldType",
    get: function get() {
      return {
        email: {
          regex: new RegExp(/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)
        },
        phone: {
          regex: new RegExp(/^(?:\+?1)?[-. ]?\(?[2-9][0-8][0-9]\)?[-. ]?[2-9][0-9]{2}[-. ]?[0-9]{4}$/i)
        },
        zipcode: {
          regex: new RegExp(/^[ABCEGHJKLMNPRSTVWXYZ][0-9][ABCEGHJKLMNPRSTVWXYZ]?[ ]?[0-9][ABCEGHJKLMNPRSTVWXYZ][0-9]$/i)
        }
      };
    }
  }, {
    key: "validations",
    get: function get() {
      return {
        "default": function _default(field) {
          var isValid = true;
          var needToValid = !!field.required || !field.required && (!!field.$el.val() || !!field.$copy && field.$copy.val().length > 1);
          field.error_code = null;

          if (needToValid) {
            if (isValid && !field.$el.val()) {
              isValid = false;
              field.error_code = 'empty';
            } // validate empty


            if (isValid && !!field.$copy && field.$copy.val() !== field.$el.val()) {
              isValid = false;
              field.error_code = 'copy';
            } // validate copy


            if (isValid && !!field.regex && !field.regex.test(field.$el.val())) {
              isValid = false;
              field.error_code = 'regex';
            }
          }

          return isValid;
        },
        text: function text(field) {
          var isValid = true;
          return isValid;
        },
        select: function select(field) {
          var isValid = true;

          if (field.required && !field.default_ok && field.$el.val() === field.defaultValue.val()) {
            isValid = false;
            field.error_code = 'default_ok';
          }

          return isValid;
        },
        checkbox: function checkbox(field) {
          var isValid = true;

          if (field.required && field.$el.filter(":checked").length === 0) {
            isValid = false;
            field.error_code = 'empty';
          }

          return isValid;
        },
        radio: function radio(field) {
          var isValid = true;

          if (field.required && field.$el.filter(":checked").length === 0) {
            isValid = false;
            field.error_code = 'empty';
          }

          return isValid;
        },
        file: function file(field) {
          var isValid = true;
          var inFileTypesArray = true;
          var regexpFiletypes = /(?:\.([^.]+))?$/;

          if (field.required && field.$el[0].files.length == 0) {
            isValid = false;
            field.error_code = 'empty';
            return isValid;
          }

          var _iterator2 = _createForOfIteratorHelper(field.$el[0].files),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var _file = _step2.value;

              for (var type in field.file_type) {
                var filetype = regexpFiletypes.exec(_file.name);

                if (field.file_type[type] != filetype[0]) {
                  inFileTypesArray = false;
                }
              }
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }

          if (!inFileTypesArray) {
            isValid = false;
            field.error_code = 'filetype';
            return isValid;
          }

          if (field.file_size) {
            var _iterator3 = _createForOfIteratorHelper(field.$el[0].files),
                _step3;

            try {
              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                var file = _step3.value;

                //bytes to kilobytes for simplicity...
                if (file.size / 1000 > field.file_size) {
                  isValid = false;
                  field.error_code = 'size';
                  return isValid;
                }
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }
          }

          return isValid;
        }
      };
    }
  }, {
    key: "hasError",
    get: function get() {
      return this.invalidFields.length > 0;
    }
  }]);

  return ValidateMe;
}();

if (!window.Me) {
  window.Me = {};
}

Me.validate = ValidateMe;