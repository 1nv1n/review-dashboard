function define(name, value) {
  Object.defineProperty(exports, name, {
    value: value,
    enumerable: true
  });
}

// Logger Level Constants
define("LOG_INFO",  "INFO");
define("LOG_WARN",  "WARN");
define("LOG_DEBUG", "DEBUG");
define("LOG_ERROR", "ERROR");