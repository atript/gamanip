/**
 * A Promise based module for working with Google Analytics Management API.
 * @module gamanip
 */
const { google } = require('googleapis');
const analytics = google.analytics('v3');
const webmasters = google.webmasters('v3');
const errors = require('./errors');
const { errorHandler } = errors;
/**
 * Number of retries for backOff function before throwing the error.
 * @kind constant
 */
const MAX_TIMEOUT_COUNT = 10;
/**
 * Starting delay in ms of exponential backoff. The pattern: 100,200,400,800...
 * @kind constant
 */
const START_TIMEOUT_TIME = 100;

/**
 * Exponential backoff wrapper for google API
 * Retries the function if error contains errors with one of following reasons 'rateLimitExceeded','quotaExceeded','userRateLimitExceeded','backendError'
 * @returns {Function}
 * @see {@link MAX_TIMEOUT_COUNT}
 * @see {@link START_TIMEOUT_TIME}
 */
function backOff(fn) {
  function tryOnce(args, backOffProps) {
    if (!backOffProps) backOffProps = { timeout: START_TIMEOUT_TIME, count: 0 };
    return fn(args).catch((err) => {
      return new Promise((resolve, reject) => {
        if (
          backOffProps.count < MAX_TIMEOUT_COUNT &&
          err.errors &&
          err.errors[0] &&
          !!~[
            'rateLimitExceeded',
            'quotaExceeded',
            'userRateLimitExceeded',
            'backendError'
          ].indexOf(err.errors[0].reason)
        ) {
          return setTimeout(() => {
            backOffProps.timeout = backOffProps.timeout * 2;
            backOffProps.count = backOffProps.count + 1;
            return tryOnce(args, backOffProps)
              .then((res) => resolve(res))
              .catch((error) => reject(error));
          }, backOffProps.timeout);
        }
        return reject(err);
      });
    });
  }
  return tryOnce;
}

/**
 * Get account summaries.
 * Returns an array of summaries for accounts. (all accounts and properties). Do not return profiles.
 * @param query
 * @param query.from { FromRoot }
 * @param query.from.oauth2Client { object }
 * @returns {Promise}
 * @fulfil {{ from: FromRoot, summary: Array.Object }} - pass down summaries along with the origin
 */
function getAccountSummaries({ from }) {
  const { oauth2Client: auth } = from;
  return analytics.management.accountSummaries
    .list({ auth })
    .then(({ data }) => ({ from, summaries: data.items }))
    .catch(errorHandler);
}

/**
 * Get accounts data.
 * Returns an array of accounts.
 * @param query
 * @param query.from { FromRoot }
 * @param query.from.oauth2Client { object } authenticated client
 * @returns {Promise}
 * @fulfil {{ from: FromRoot, accounts: Array.Object }} - pass down accounts along with the origin
 */
function getAccounts({ from }) {
  const { oauth2Client: auth } = from;
  return analytics.management.accounts
    .list({ auth })
    .then(({ data }) => ({ from, accounts: data.items }))
    .catch(errorHandler);
}

/**
 * Get web properties data.
 * Returns an array of web properties.
 * @param query
 * @param query.from { FromAccount }
 * @param query.from.oauth2Client { object } authenticated client
 * @param query.from.accountId { string } the id of account in GA
 * @returns {Promise}
 * @fulfil {{ from: FromAccount, webProperties: Array.Object }} - pass down webProperties along with the origin
 */
function getWebProperties({ from }) {
  const { oauth2Client: auth, accountId } = from;
  return analytics.management.webproperties
    .list({ auth, accountId })
    .then(({ data }) => ({ from, webProperties: data.items }))
    .catch(errorHandler);
}

/**
 * Get web property data.
 * Returns an array of web properties.
 * @param query
 * @param query.from { FromWebProperty }
 * @param query.from.oauth2Client { object } authenticated client
 * @param query.from.accountId { string } the id of account in GA
 * @param query.from.webPropertyId { string } the id of web  in GA
 * @returns {Promise}
 * @fulfil {{ from: FromWebProperty, webProperty: Object }} - pass down webProperty along with the origin
 */
function getWebProperty({ from }) {
  const { oauth2Client: auth, accountId, webPropertyId } = from;
  return analytics.management.webproperties
    .get({ auth, accountId, webPropertyId })
    .then(({ data }) => ({ from, webProperty: data }))
    .catch(errorHandler);
}

/**
 * Get web property data.
 * Returns an array of web properties.
 * @param query
 * @param query.from { FromWebProperty }
 * @param query.from.oauth2Client { object } authenticated client
 * @param query.from.accountId { string } the id of account in GA
 * @param query.webProperty { object } the id of web  in GA
 * @returns {Promise}
 * @fulfil {{ from: FromWebProperty, webProperty: Object }} - pass down webProperty along with the origin
 */
function insertWebProperty({ to, webProperty }) {
  const { oauth2Client: auth, accountId } = to;
  return analytics.management.webproperties
    .insert({ auth, accountId })
    .then(({ data }) => ({ to, webProperty: data }))
    .catch(errorHandler);
}

/**
 * Get dimensions data.
 * Returns an array of dimensions.
 * @param query
 * @param query.from { FromWebProperty }
 * @param query.from.oauth2Client { object } authenticated client
 * @param query.from.accountId { string } the id of account in GA
 * @param query.from.webPropertyId { string } the id of web  in GA
 * @returns {Promise}
 * @fulfil {{ from: FromWebProperty, webProperty: Object }} - pass down dimentsions along with the origin
 */
function getDimensions({ from }) {
  const { oauth2Client: auth, accountId, webPropertyId } = from;
  return analytics.management.customDimensions
    .list({ auth, accountId, webPropertyId })
    .then(({ data }) => ({ from, dimensions: data.items }))
    .catch(errorHandler);
}

/**
 * Insert dimension to a view.
 * Returns a created dimension.
 * @param query
 * @param query.from { FromProfile }
 * @param query.from.oauth2Client { object } authenticated client
 * @param query.from.accountId { string } the id of account in GA
 * @param query.from.webPropertyId { string } the id of webProperty in GA
 * @param query.dimension { object } the dimension
 * @returns {Promise}
 * @fulfil {{ from: FromProfile, dimension: Object }} - pass down dimension along with the origin
 */
function insertDimensions({ to, dimension }) {
  const { oauth2Client: auth, accountId, webPropertyId } = to;
  return analytics.management.customDimensions
    .insert({
      auth,
      accountId,
      webPropertyId,
      resource: dimension
    })
    .then(({ data }) => ({ from, dimension: data }))
    .catch(errorHandler);
}
/**
 * Patch dimension to a view.
 * Returns a created dimension.
 * @param query
 * @param query.from { FromProfile }
 * @param query.from.oauth2Client { object } authenticated client
 * @param query.from.accountId { string } the id of account in GA
 * @param query.from.webPropertyId { string } the id of webProperty in GA
 * @param query.dimension { object } the dimension
 * @returns {Promise}
 * @fulfil {{ from: FromProfile, dimension: Object }} - pass down dimension along with the origin
 */
function patchDimensions({ to, dimension }) {
  const { oauth2Client: auth, accountId, webPropertyId, profileId } = to;
  const { id: customDimensionId } = dimension;
  return analytics.management.customDimensions
    .patch({
      auth,
      accountId,
      webPropertyId,
      customDimensionId,
      resource: dimension
    })
    .then(({ data }) => ({ from, dimension: data }))
    .catch(errorHandler);
}

/**
 * Get metrics data.
 * Returns an array of metrics.
 * @param query
 * @param query.from { FromWebProperty }
 * @param query.from.oauth2Client { object } authenticated client
 * @param query.from.accountId { string } the id of account in GA
 * @param query.from.webPropertyId { string } the id of web  in GA
 * @returns {Promise}
 * @fulfil {{ from: FromWebProperty, webProperty: Object }} - pass down metrics along with the origin
 */
function getMetrics({ from }) {
  const { oauth2Client: auth, accountId, webPropertyId } = from;
  return analytics.management.customMetrics
    .list({ auth, accountId, webPropertyId })
    .then(({ data }) => ({ from, metrics: data.items }))
    .catch(errorHandler);
}

/**
 * Insert metric to a view.
 * Returns a created metric.
 * @param query
 * @param query.from { FromProfile }
 * @param query.from.oauth2Client { object } authenticated client
 * @param query.from.accountId { string } the id of account in GA
 * @param query.from.webPropertyId { string } the id of webProperty in GA
 * @returns {Promise}
 * @fulfil {{ from: FromProfile, metric: Object }} - pass down metric along with the origin
 */
function insertMetrics({ to, metric }) {
  const { oauth2Client: auth, accountId, webPropertyId } = to;
  return analytics.management.customMetrics
    .insert({
      auth,
      accountId,
      webPropertyId,
      resource: metric
    })
    .then(({ data }) => ({ from, metric: data }))
    .catch(errorHandler);
}
/**
 * Patch metric to a view.
 * Returns a created metric.
 * @param query
 * @param query.from { FromProfile }
 * @param query.from.oauth2Client { object } authenticated client
 * @param query.from.accountId { string } the id of account in GA
 * @param query.from.webPropertyId { string } the id of webProperty in GA
 * @returns {Promise}
 * @fulfil {{ from: FromProfile, metric: Object }} - pass down metric along with the origin
 */
function patchMetrics({ to, metric }) {
  const { oauth2Client: auth, accountId, webPropertyId } = to;
  const { id: customMetricId } = metric;
  return analytics.management.customMetrics
    .patch({
      auth,
      accountId,
      webPropertyId,
      customMetricId,
      resource: metric
    })
    .then(({ data }) => ({ from, metric: data }))
    .catch(errorHandler);
}

/**
 * Get views from web property.
 * Returns an array of views.
 * @param query
 * @param query.from { FromWebProperty }
 * @param query.from.oauth2Client { object } authenticated client
 * @param query.from.accountId { string } the id of account in GA
 * @param query.from.webPropertyId { string } the id of web  in GA
 * @returns {Promise}
 * @fulfil {{ from: FromWebProperty, views: Array.Object }} - pass down views along with the origin
 */
function getViews({ from }) {
  const { oauth2Client: auth, accountId, webPropertyId } = from;
  return analytics.management.profiles
    .list({ auth, accountId, webPropertyId })
    .then(({ data }) => ({ from, views: data.items }))
    .catch(errorHandler);
}

/**
 * Get views from web property.
 * Returns an array of views.
 * @param query
 * @param query.from { FromProfile }
 * @param query.from.oauth2Client { object } authenticated client
 * @param query.from.accountId { string } the id of account in GA
 * @param query.from.webPropertyId { string } the id of webProperty in GA
 * @param query.from.profileId { string } the id of view in GA
 * @returns {Promise}
 * @fulfil {{ from: FromProfile, view: Object }} - pass down views along with the origin
 */
function getView({ from }) {
  const { oauth2Client: auth, accountId, webPropertyId, profileId, quotaUser } = from;
  return analytics.management.profiles
    .get({
      auth,
      accountId,
      webPropertyId,
      quotaUser,
      profileId
    })
    .then(({ data }) => ({ from, view: data }))
    .catch(errorHandler);
}

/**
 * Insert view to web property.
 * Returns an array of views.
 * @param query
 * @param query.from { FromProfile }
 * @param query.from.oauth2Client { object } authenticated client
 * @param query.from.accountId { string } the id of account in GA
 * @param query.from.webPropertyId { string } the id of webProperty in GA
 * @param query.view { object } the view
 * @returns {Promise}
 * @fulfil {{ from: FromProfile, view: Object }} - pass down views along with the origin
 */
function insertView({ to, view }) {
  const { oauth2Client: auth, accountId, webPropertyId, quotaUser } = to;
  return analytics.management.profiles
    .insert({
      auth,
      accountId,
      webPropertyId,
      resource: view
    })
    .then(({ data }) => ({ from, view: data }))
    .catch(errorHandler);
}

/**
 * Get goals from view.
 * Returns an array of goals.
 * @param query
 * @param query.from { FromProfile }
 * @param query.from.oauth2Client { object } authenticated client
 * @param query.from.accountId { string } the id of account in GA
 * @param query.from.webPropertyId { string } the id of webProperty in GA
 * @param query.from.profileId { string } the id of view in GA
 * @returns {Promise}
 * @fulfil {{ from: FromProfile, view: Object }} - pass down views along with the origin
 */
function getGoals({ from }) {
  const { oauth2Client: auth, accountId, webPropertyId, profileId, quotaUser } = from;
  return analytics.management.goals
    .list({
      auth,
      accountId,
      webPropertyId,
      quotaUser,
      profileId
    })
    .then(({ data }) => ({ from, goals: data.items }))
    .catch(errorHandler);
}

/**
 * Insert goal to a view.
 * Returns a created goal.
 * @param query
 * @param query.from { FromProfile }
 * @param query.from.oauth2Client { object } authenticated client
 * @param query.from.accountId { string } the id of account in GA
 * @param query.from.webPropertyId { string } the id of webProperty in GA
 * @param query.from.profileId { string } the id of view in GA
 * @returns {Promise}
 * @fulfil {{ from: FromProfile, goal: Object }} - pass down goal along with the origin
 */
function insertGoals({ to, goal }) {
  const { oauth2Client: auth, accountId, webPropertyId, profileId } = to;
  return analytics.management.goals
    .insert({
      auth,
      accountId,
      webPropertyId,
      profileId,
      resource: goal
    })
    .then(({ data }) => ({ from, goal: data }))
    .catch(errorHandler);
}

/*
{
  accountId,
  webPropertyId,
  webProperty: {
    id:
  },
  customDimensions: [{
    customDimension: {}
    customDimensionId
  }]
  customMetrics: [{
    customMetric: {}
    customMetricId
  }],
  views: [
    {
      view: {
        id
      },
      profileId,
      goals: [],
      filters: [{
        name: '...',
        unique: 'name'
      }]
    }
  ]
}

ref = new RefObj(referenceObject)
ref.account(id);
ref.webProperty({})
ref.view({view},[goals], [filters])

*/
function ReferenceObject() {
  let referenceObject = {};
  this.account = ({ id }) => {
    referenceObject.accountId = id;
  };
  this.webProperty = ({ id }) => {
    referenceObject = { ...referenceObject, webProperty: { id }, webPropertyId: id };
  };
  this.view = ({}, /*goals*/ [], /*filters*/ []) => {
    referenceObject = { ...referenceObject, webProperty: { id }, webPropertyId: id };
  };
  return this;
}

function make({ oauth2Client, referenceObject }) {
  //if !webPropertyId - insert web property
  //if webPropertyId
  //  - if !webProperty - fail
  //  - if webPropertydiff - patch
  //customMetrics
  // check customMetrics
  // if(exists) diff/patch
  // if(!exists) insert
  //customDimensions
  // check customDimensions
  // if(exists) diff/patch
  // if(!exists) insert
  //if !profile - insert
  //if profileId
  //  - if !profile - fail
  //  - if profilediff - patch
  //goals
  // check goals
  // if(exists) diff/patch
  // if(!exists) insert
}

//TODO: function getFilters
//TODO: function cleanFilters

//TODO: function get predictedNumberOfUrls
//TODO: getHostNames
/*
function getHostNames({ from }) {
  return new Promise((resolve, reject) => {
    let today = new Date();
    let thirtyDaysBack = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    analytics.data.ga.get(
      {
        auth: from.oauth2Client,
        ids: `ga:${from.profileId}`,
        metrics: 'ga:sessions',
        dimensions: 'ga:hostname',
        'start-date': yyyymmdd(thirtyDaysBack),
        'end-date': yyyymmdd(today)
      },
      (err, data) => {
        if (!data || !data.rows) return resolve({ from, hostName: null });
        const hostNames = data.rows.reduce(filterValidDomains, []).sort((a, b) => +a[1] < +b[1]);
        if (!hostNames) return resolve({ from, hostNames: [] });
        if (err) return reject(err);
        resolve({ from, hostNames });
      }
    );
  });
}

function getHostName({ from }) {
  return new Promise((resolve, reject) => {
    let today = new Date();
    let thirtyDaysBack = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    analytics.data.ga.get(
      {
        auth: from.oauth2Client,
        ids: `ga:${from.analyticsViewId}`,
        metrics: 'ga:sessions',
        dimensions: 'ga:hostname',
        'start-date': yyyymmdd(thirtyDaysBack),
        'end-date': yyyymmdd(today)
      },
      (err, data) => {
        if (!data || !data.rows) return resolve({ from, hostName: null });
        const domainItem = data.rows.reduce(filterValidDomains, []).reduce(filterMax, null);
        if (!domainItem) return resolve({ from, hostName: null });
        const hostName = domainItem[0];
        if (err) return reject(err);
        resolve({ from, hostName });
      }
    );
  });
}

function filterMax(result, item) {
  if (!result || +result[1] < +item[1]) return item;
  return result;
}

function filterValidDomains(result, item) {
  if (isValidDomain(item[0])) result.push(item);
  return result;
}

function isValidDomain(name) {
  if (name === 'localhost') return false;
  return /\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b/.test(name);
}

function count({ pages }) {
  return pages.length;
}

function falseOnError(err) {
  return Promise.resolve(false);
}

function denormalizeSiteName(siteName) {
  const normalizedName = normalizeSiteName(siteName);
  return [
    `http://${normalizedName}`,
    `https://${normalizedName}`,
    `http://www.${normalizedName}`,
    `https://www.${normalizedName}`
  ];
}
function normalizeSiteName(siteName) {
  return siteName.replace(/^https?\:\/\//, '').replace(/^www\./, '');
}

function yyyymmdd(date) {
  var mm = date.getMonth() + 1; // getMonth() is zero-based
  var dd = date.getDate();

  return [date.getFullYear(), (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join('-');
}

function parseGoogleDate(dateString) {
  const date = new Date(
    +dateString.substr(0, 4),
    +dateString.substr(4, 2) - 1,
    +dateString.substr(6, 2)
  );
  return `${date.getDate()} ${monthNames[date.getMonth()]}`;
}
*/
module.exports = {
  getAccountSummaries: backOff(getAccountSummaries),
  getAccounts: backOff(getAccounts),
  getWebProperties: backOff(getWebProperties),
  getWebProperty: backOff(getWebProperty),
  insertWebProperty: backOff(insertWebProperty),
  getMetrics: backOff(getMetrics),
  insertMetrics: backOff(insertMetrics),
  patchMetrics: backOff(patchMetrics),
  getDimensions: backOff(getDimensions),
  insertDimensions: backOff(insertDimensions),
  patchDimensions: backOff(patchDimensions),
  getViews: backOff(getViews),
  getView: backOff(getView),
  insertView: backOff(insertView),
  getGoals: backOff(getGoals),
  insertGoals: backOff(insertGoals),

  make: make,
  //getHostName: backOff(getHostName),
  //getHostNames: backOff(getHostNames),
  backOff: backOff
};

/**
 *  @typedef FromRoot
 *  @type {object}
 *  @property {object} oauth2Client - oauth2Client
 */

/**
 *  @typedef FromAccount
 *  @type {object}
 *  @property {object} oauth2Client - oauth2Client
 *  @property {string} accountId - accountId
 */

/**
 *  @typedef FromWebProperty
 *  @type {object}
 *  @property {object} oauth2Client - oauth2Client authenticated client
 *  @property {string} accountId - accountId
 *  @property {string} webPropertyId - webPropertyId
 */

/**
 *  @typedef FromProfile
 *  @type {object}
 *  @property {object} oauth2Client - oauth2Client authenticated client
 *  @property {string} accountId - accountId
 *  @property {string} webPropertyId - webPropertyId
 *  @property {string} profileId - profileId
 */
