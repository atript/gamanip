/**
 * A Promise based module for working with Google Analytics Management API.
 * @module gamanip
 */
const { google } = require('googleapis');
const analytics = google.analytics('v3');
const webmasters = google.webmasters('v3');
const errors = require('../../errors');
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
 * @returns {Promise}
 * @fulfil {{ from: FromRoot, summary: Array.Object }} - pass down summaries along with the origin
 */
function getAccountSummaries({ from }) {
  const { oauth2Client: auth } = from;
  return analytics.management.accountSummaries
    .list({ auth })
    .then(({ data }) => ({ from, summaries: data.items }));
}

/**
 * Get accounts data.
 * Returns an array of accounts.
 * @returns {Promise}
 * @fulfil {{ from: FromRoot, accounts: Array.Object }} - pass down accounts along with the origin
 */
function getAccounts({ from }) {
  const { oauth2Client: auth } = from;
  return analytics.management.accounts
    .list({ auth })
    .then(({ data }) => ({ from, accounts: data.items }));
}

/**
 * Get web properties data.
 * Returns an array of web properties.
 * @returns {Promise}
 * @fulfil {{ from: FromAccount, webProperties: Array.Object }} - pass down webProperties along with the origin
 */
function getWebProperties({ from }) {
  const { oauth2Client: auth, accountId } = from;
  return analytics.management.webproperties
    .list({ auth, accountId })
    .then(({ data }) => ({ from, webProperties: data.items }));
}

/**
 * Get views from web property.
 * Returns an array of views.
 * @returns {Promise}
 * @fulfil {{ from: FromWebProperty, views: Array.Object }} - pass down views along with the origin
 */
function getViews({ from }) {
  const { oauth2Client: auth, accountId, webPropertyId } = from;
  return analytics.management.profiles
    .list({ auth, accountId, webPropertyId })
    .then(({ data }) => ({ from, views: data.items }));
}

function getGoals({ from }) {
  return new Promise((resolve, reject) => {
    analytics.management.goals.list(
      {
        accountId: from.gaAccountId,
        profileId: from.profileId,
        webPropertyId: from.webPropertyId,
        auth: from.oauth2Client
      },
      (err, goals) => {
        if (err) return reject(err);
        resolve({ from, goals });
      }
    );
  });
}

function getWebProperty({ from }) {
  return new Promise((resolve, reject) => {
    analytics.management.webproperties.get(
      {
        auth: from.oauth2Client,
        accountId: from.accountId,
        webPropertyId: from.webPropertyId
      },
      (err, { data: webProperty }) => {
        if (err) return reject(err);
        resolve({ from, webProperty });
      }
    );
  });
}

function insertWebProperty({ to, webProperty }) {
  return new Promise((resolve, reject) => {
    analytics.management.webproperties.insert(
      {
        auth: to.oauth2Client,
        accountId: to.gaAccountId,
        quotaUser: to.gaAccountId,
        resource: webProperty
      },
      (err, { data: newWebproperty }) => {
        if (err) console.log(`insertWebProperty fail ${to.gaAccountId}`);
        if (err) console.log(err);
        if (err) return reject(err);
        resolve({ to, webproperty: newWebproperty });
      }
    );
  });
}

function getView({ from }) {
  return new Promise((resolve, reject) => {
    analytics.management.profiles.get(
      {
        auth: from.oauth2Client,
        accountId: from.gaAccountId,
        webPropertyId: from.webPropertyId,
        quotaUser: from.gaAccountId,
        profileId: from.analyticsViewId
      },
      (err, { data: view }) => {
        if (err) return reject(err);
        resolve({ from, view });
      }
    );
  });
}

function insertViewId({ to, view }) {
  return new Promise((resolve, reject) => {
    analytics.management.profiles.insert(
      {
        auth: to.oauth2Client,
        accountId: to.gaAccountId,
        webPropertyId: to.webPropertyId,
        quotaUser: to.gaAccountId,
        resource: view
      },
      (err, { data: view }) => {
        if (err) return reject(err);
        resolve({ to, view });
      }
    );
  });
}

function insertGoals({ to, goal }) {
  return new Promise((resolve, reject) => {
    analytics.management.goals.insert(
      {
        auth: to.oauth2Client,
        accountId: to.gaAccountId,
        webPropertyId: to.webPropertyId,
        profileId: to.profileId,
        quotaUser: to.gaAccountId,
        resource: goal
      },
      (err, { data: goal }) => {
        if (err) return reject(err);
        resolve({ to, goal });
      }
    );
  });
}

function insertDimensions({ to, dimension }) {
  return new Promise((resolve, reject) => {
    analytics.management.customDimensions.insert(
      {
        auth: to.oauth2Client,
        accountId: to.gaAccountId,
        quotaUser: to.gaAccountId,
        webPropertyId: to.webPropertyId,
        resource: dimension
      },
      (err, dimension) => {
        if (err) return reject(err);
        resolve({ to, dimension });
      }
    );
  });
}

function patchDimensions({ to, dimension }) {
  return new Promise((resolve, reject) => {
    analytics.management.customDimensions.patch(
      {
        auth: to.oauth2Client,
        accountId: to.gaAccountId,
        quotaUser: to.gaAccountId,
        webPropertyId: to.webPropertyId,
        customDimensionId: dimension.id,
        resource: dimension
      },
      (err, dimension) => {
        if (err) return reject(err);
        resolve({ to, dimension });
      }
    );
  });
}

function getDimensions({ from }) {
  return new Promise((resolve, reject) => {
    analytics.management.customDimensions.list(
      {
        auth: from.oauth2Client,
        accountId: from.gaAccountId,
        quotaUser: from.gaAccountId,
        webPropertyId: from.webPropertyId
      },
      (err, { data = {} } = {}) => {
        if (err) return reject(err);
        resolve({ from, dimension: data.items });
      }
    );
  });
}

function insertMetrics({ to, metrics }) {
  return new Promise((resolve, reject) => {
    analytics.management.customMetrics.insert(
      {
        auth: to.oauth2Client,
        accountId: to.gaAccountId,
        webPropertyId: to.webPropertyId,
        quotaUser: to.gaAccountId,
        resource: metrics
      },
      (err, metrics) => {
        if (err) return reject(err);
        resolve({ to, metrics });
      }
    );
  });
}
function patchMetrics({ to, metrics }) {
  return new Promise((resolve, reject) => {
    analytics.management.customMetrics.patch(
      {
        auth: to.oauth2Client,
        accountId: to.gaAccountId,
        webPropertyId: to.webPropertyId,
        quotaUser: to.gaAccountId,
        customMetricId: metrics.id,
        resource: metrics
      },
      (err, metrics) => {
        if (err) return reject(err);
        resolve({ to, metrics });
      }
    );
  });
}

function getMetrics({ from }) {
  return new Promise((resolve, reject) => {
    analytics.management.customMetrics.list(
      {
        auth: from.oauth2Client,
        accountId: from.gaAccountId,
        quotaUser: from.gaAccountId,
        webPropertyId: from.webPropertyId
      },
      (err, metrics) => {
        if (err) return reject(err);
        resolve({ from, metrics });
      }
    );
  });
}

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

module.exports = {
  getAccountSummaries: backOff(getAccountSummaries),
  getAccounts: backOff(getAccounts),
  getWebProperties: backOff(getWebProperties),
  getViews: backOff(getViews),

  insertWebProperty: backOff(insertWebProperty),
  insertViewId: backOff(insertViewId),
  insertGoals: backOff(insertGoals),
  insertDimensions: backOff(insertDimensions),
  patchDimensions: backOff(patchDimensions),
  insertMetrics: backOff(insertMetrics),
  patchMetrics: backOff(patchMetrics),
  getMetrics: backOff(getMetrics),

  getWebProperty: backOff(getWebProperty),

  getGoals: backOff(getGoals),
  getView: backOff(getView),
  getDimensions: backOff(getDimensions),

  getHostName: backOff(getHostName),
  getHostNames: backOff(getHostNames),
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
