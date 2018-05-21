function define(name, value) {
  Object.defineProperty(exports, name, {
    value: value,
    enumerable: true
  });
}

// HTTP-URL export constants
define("HTTP_PREFIX", "http://");
define("GET_METHOD", "GET");
define("POST_METHOD", "POST");

// Crucible
define("CRUCIBLE_BASE_URL",      "/viewer/cru/");
define("CRUCIBLE_USER_URL",      "/viewer/user/");
define("CRUCIBLE_USERS_URL",     "?username:");
define("CRUCIBLE_REST_BASE_URL", "/viewer/rest-service");
define("CRUCIBLE_REST_REVIEWS",  "/reviews-v1/");
define("CRUCIBLE_REST_USERS",    "/users-v1");
define("CRUCIBLE_AUTH",          "/auth/login");
define("CRUCIBLE_REVIEWERS",     "/reviewers");
define("USER_ID",                "?username=");
define("VERSION_INFO",           "/versionInfo");

// FishEye
define("FE_CRU_REST_BASE_URL", "/viewer/rest-service-fecru");

define("FILTER_DETAILS", "filter/details");
define("CREATOR", "&creator=");

// Open Reviews
define("OPEN_REVIEWS_SIMPLE_FILTER",   "filter/open");
define("OPEN_REVIEWS_DETAILED_FILTER", "filter/open/details");

// Pending (To Do) Reviews
define("PENDING_REVIEWS_SIMPLE_FILTER",   "filter/toReview");
define("PENDING_REVIEWS_DETAILED_FILTER", "filter/toReview/details");

// Review Actions
define("CLOSE_REVIEW",          "/close");
define("REMIND_ABOUT_REVIEW",   "/remind");
define("COMPLETE_REVIEW",       "/complete");
define("COMPLETE_IGNORE_WARN",  "&ignoreWarnings=true");
define("REVIEWERS_UNCOMPLETED", "/reviewers/uncompleted");
define("SEARCH_BY_ISSUE",       "/search-v1/reviewsForIssue?jiraKey=");

// Atlassian API
define("FEAUTH", "?FEAUTH=");