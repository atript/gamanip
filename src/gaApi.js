/**
 * A Promise based module for working with Google Analytics Management API.
 * @module gamanip
 */
const { google } = require('googleapis');
const analytics = google.analytics('v3');
const webmasters = google.webmasters('v3');
const errors = require('./errors');
const { insertServiceError, GoogleAnalyticsError } = errors;
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
    .catch((err) => Promise.reject(new GoogleAnalyticsError(err)));
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
    .catch((err) => Promise.reject(new GoogleAnalyticsError(err)));
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
    .catch((err) => Promise.reject(new GoogleAnalyticsError(err)));
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
    .catch((err) => Promise.reject(new GoogleAnalyticsError(err)));
}

/**
 * Get web property data.
 * Returns an array of web properties.
 * @param query
 * @param query.to { FromWebProperty }
 * @param query.to.oauth2Client { object } authenticated client
 * @param query.to.accountId { string } the id of account in GA
 * @param query.webProperty { object } the id of web  in GA
 * @returns {Promise}
 * @fulfil {{ from: FromWebProperty, webProperty: Object }} - pass down webProperty along with the origin
 */
function insertWebProperty({ to, webProperty }) {
  const { oauth2Client: auth, accountId } = to;
  return analytics.management.webproperties
    .insert({ auth, accountId, resource: webProperty })
    .then(({ data }) => ({ to, webProperty: data }))
    .catch((err) => Promise.reject(new GoogleAnalyticsError(err)));
}

/**
 * Patch web property data.
 * Returns an array of web properties.
 * @param query
 * @param query.to { FromWebProperty }
 * @param query.to.oauth2Client { object } authenticated client
 * @param query.to.accountId { string } the id of account in GA
 * @param query.from.webPropertyId { string } the id of web  in GA
 * @param query.webProperty { object } the id of web  in GA
 * @returns {Promise}
 * @fulfil {{ from: FromWebProperty, webProperty: Object }} - pass down webProperty along with the origin
 */
function patchWebProperty({ to, webProperty }) {
  const { oauth2Client: auth, accountId, webPropertyId } = to;
  return analytics.management.webproperties
    .patch({ auth, accountId, webPropertyId, resource: webProperty })
    .then(({ data }) => ({ to, webProperty: data }))
    .catch((err) => Promise.reject(new GoogleAnalyticsError(err)));
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
    .catch((err) => Promise.reject(new GoogleAnalyticsError(err)));
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
    .then(({ data }) => ({ to, dimension: data }))
    .catch((err) => Promise.reject(new GoogleAnalyticsError(err)));
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
    .then(({ data }) => ({ to, dimension: data }))
    .catch((err) => Promise.reject(new GoogleAnalyticsError(err)));
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
    .catch((err) => Promise.reject(new GoogleAnalyticsError(err)));
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
    .then(({ data }) => ({ to, metric: data }))
    .catch((err) => Promise.reject(new GoogleAnalyticsError(err)));
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
    .then(({ data }) => ({ to, metric: data }))
    .catch((err) => Promise.reject(new GoogleAnalyticsError(err)));
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
    .catch((err) => Promise.reject(new GoogleAnalyticsError(err)));
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
    .catch((err) => Promise.reject(new GoogleAnalyticsError(err)));
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
    .then(({ data }) => ({ to, view: data }))
    .catch((err) => Promise.reject(new GoogleAnalyticsError(err)));
}

/**
 * Patch view to web property.
 * Returns an array of views.
 * @param query
 * @param query.from { FromProfile }
 * @param query.from.oauth2Client { object } authenticated client
 * @param query.from.accountId { string } the id of account in GA
 * @param query.from.webPropertyId { string } the id of webProperty in GA
 * @param query.from.profileId { string } the id of profileId in GA
 * @param query.view { object } the view
 * @returns {Promise}
 * @fulfil {{ from: FromProfile, view: Object }} - pass down views along with the origin
 */
function patchView({ to, view }) {
  const { oauth2Client: auth, accountId, webPropertyId, profileId, quotaUser } = to;
  return analytics.management.profiles
    .patch({
      auth,
      accountId,
      webPropertyId,
      profileId,
      resource: view
    })
    .then(({ data }) => ({ to, view: data }))
    .catch((err) => Promise.reject(new GoogleAnalyticsError(err)));
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
    .catch((err) => Promise.reject(new GoogleAnalyticsError(err)));
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
function insertGoal({ to, goal }) {
  const { oauth2Client: auth, accountId, webPropertyId, profileId } = to;
  return analytics.management.goals
    .insert({
      auth,
      accountId,
      webPropertyId,
      profileId,
      resource: goal
    })
    .then(({ data }) => ({ to, goal: data }))
    .catch((err) => Promise.reject(new GoogleAnalyticsError(err)));
}
/**
 * Patch goal to a view.
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
function patchGoal({ to, goal }) {
  const { oauth2Client: auth, accountId, webPropertyId, profileId, goalId } = to;
  return analytics.management.goals
    .patch({
      auth,
      accountId,
      webPropertyId,
      profileId,
      goalId,
      resource: goal
    })
    .then(({ data }) => ({ to, goal: data }))
    .catch((err) => Promise.reject(new GoogleAnalyticsError(err)));
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
function ReferenceObject(referenceObject = {}) {
  this.account = ({ id, accountId }) => {
    referenceObject.accountId = id || accountId;
  };
  this.webProperty = ({
    id,
    webPropertyId,
    name,
    websiteUrl,
    industryVertical = 'UNSPECIFIED'
  }) => {
    id = id || webPropertyId || undefined;
    referenceObject = {
      ...referenceObject,
      webProperty: { id, name, websiteUrl, industryVertical },
      webPropertyId: id
    };
  };
  this.view = (
    { id, profileId, name, currency, timezone, websiteUrl, type = 'WEB', eCommerceTracking },
    /*goals*/ goals = [],
    /*filters*/ filters = []
  ) => {
    id = id || profileId || undefined;
    let newView = {
      view: { id, profileId, name, currency, timezone, websiteUrl, type, eCommerceTracking },
      profileId: id,
      goals: goals.map(({ active, type, eventDetails }) => ({ active, type, eventDetails })),
      filters: filters.map(({ includeDetails, name, type, uniqueKey }) => ({
        includeDetails,
        name,
        type,
        uniqueKey
      }))
    };
    referenceObject = { ...referenceObject, views: [...(referenceObject.views || []), newView] };
  };
  this.customMetrics = (metrics = []) => {
    referenceObject = {
      ...referenceObject,
      customMetrics: metrics.map(({ name, scope, active, type }) => ({ name, scope, active, type }))
    };
  };
  this.customDimensions = (dimensions = []) => {
    referenceObject = {
      ...referenceObject,
      customDimensions: dimensions.map(({ name, scope, active }) => ({ name, scope, active }))
    };
  };
  this.toJson = () => referenceObject;
  this.toString = () => JSON.stringify(referenceObject, null, 2);
  return this;
}
/*
var ref = new ReferenceObject();
ref.account({id: 1234});
ref.webProperty({name: "NewAcc", websiteUrl:"http://someUrl"});
ref.view({name: "New View", websiteUrl:"http://someUrl"});
ref.view({name: "Another View", websiteUrl:"http://someUrl"});
console.log(ref.toJson())
*/
/*
{
  "accountId": 1234,
  "webProperty": {
    "name": "NewAcc",
    "websiteUrl": "http://someUrl",
    "industryVertical": "UNSPECIFIED"
  },
  "views": [
    {
      "view": {
        "name": "New View",
        "websiteUrl": "http://someUrl",
        "type": "WEB"
      },
      "goals": [],
      "filters": []
    },
    {
      "view": {
        "name": "Another View",
        "websiteUrl": "http://someUrl",
        "type": "WEB"
      },
      "goals": [],
      "filters": []
    }
  ]
}
*/
//TODO: finish
function shouldBeChanged(source, target) {
  if (target === null) return false;
  return !Object.keys(target).reduce((r, k) => {
    if (!r) return r;
    if (typeof target[k] !== 'object' && typeof target[k] !== 'array')
      return target[k] === source[k];
    if (typeof target[k] === 'array') return target[k].length === source[k].length;
    if (typeof target[k] === 'object') return !shouldBeChanged(source[k] || {}, target[k]);
    return false;
  }, true);
}

function findWebPropertyByUniqueKey(key, value) {
  return ({ webProperties }) => {
    webProperties = webProperties.filter((wp) => wp[key] === webProperty[key]);
    return webProperties.length > 0 ? { webProperty: webProperties[0] } : {};
  };
}
function findViewByUniqueKey(key, value) {
  return ({ views }) => {
    views = views.filter((wp) => wp[key] === value);
    return views.length > 0 ? { view: views[0] } : {};
  };
}

function make({ oauth2Client, referenceObject }) {
  let pipe = Promise.resolve(referenceObject);
  let {
    accountId,
    webProperty,
    webPropertyId,
    customMetrics,
    customDimensions,
    views
  } = referenceObject;
  if (!accountId) return Promise.reject(new ServiceError(412, `accountId should be defined`));

  if (!webPropertyId && webProperty.uniqueKey) {
    console.log(`!webPropertyId && webProperty.uniqueKey`);
    pipe = pipe
      .then(() => ({ from: { oauth2Client, accountId } }))
      .then(getWebProperties)
      .then(findWebPropertyByUniqueKey(webProperty.uniqueKey, webProperty))
      .then(({ webProperty: publishedWebProperty }) => {
        //TODO: if not found
        webPropertyId = publishedWebProperty.id;
        referenceObject.webPropertyId = publishedWebProperty.id;
        referenceObject.webProperty.id = publishedWebProperty.id;
        //make a diff and patch if required
        if (shouldBeChanged(publishedWebProperty, referenceObject.webProperty)) {
          return patchWebProperty({
            to: { oauth2Client, accountId, webPropertyId: referenceObject.webPropertyId },
            webProperty: referenceObject.webProperty
          });
        }
        return { webProperty: referenceObject.webProperty };
      });
  }
  if (!webPropertyId && !webProperty.uniqueKey) {
    console.log(`!webPropertyId && !webProperty.unique`);
    pipe = pipe
      .then(() => ({ to: { oauth2Client, accountId }, webProperty }))
      .then(insertWebProperty)
      .then(({ webProperty: newWebProperty }) => {
        //add changes to referenceObject
        webPropertyId = newWebProperty.id;
        referenceObject.webPropertyId = newWebProperty.id;
        referenceObject.webProperty.id = newWebProperty.id;
        return { webProperty: newWebProperty };
      });
  }
  if (webPropertyId) {
    pipe = pipe
      .then(() => ({ from: { oauth2Client, accountId, webPropertyId } }))
      .then(getWebProperty)
      .then(({ webProperty: publishedWebProperty }) => {
        //TODO: WHAT if hasn't found
        if (shouldBeChanged(publishedWebProperty, referenceObject.webProperty)) {
          return patchWebProperty({
            to: { oauth2Client, accountId, webPropertyId: referenceObject.webPropertyId },
            webProperty: referenceObject.webProperty
          });
        }
        return { webProperty: referenceObject.webProperty };
      });
  }
  if (customMetrics) {
    pipe = pipe
      .then(() => ({ from: { oauth2Client, accountId, webPropertyId } }))
      .then(getMetrics)
      .then(({ metrics: existingMetrics }) => {
        return customMetrics.reduce((nextMetric, metric, metricIdx) => {
          return nextMetric.then(() => {
            if (existingMetrics[metricIdx] && shouldBeChanged(existingMetrics[metricIdx], metric)) {
              console.log('patch metric');
              metric.id = `ga:metric${metricIdx + 1}`;
              metric.index = metricIdx + 1;
              return patchMetrics({
                to: { oauth2Client, accountId, webPropertyId, customMetricId: metric.id },
                metric
              }).then(({ metric: newMetric }) => (metric.id = newMetric.id));
            }
            if (!existingMetrics[metricIdx]) {
              console.log('insert metric');
              metric.id = `ga:metric${metricIdx + 1}`;
              metric.index = metricIdx + 1;
              return insertMetrics({ to: { oauth2Client, accountId, webPropertyId }, metric }).then(
                ({ metric: newMetric }) => (metric.id = newMetric.id)
              );
            }
            return true;
          });
        }, Promise.resolve());
      });
  }
  if (customDimensions) {
    pipe = pipe
      .then(() => ({ from: { oauth2Client, accountId, webPropertyId } }))
      .then(getDimensions)
      .then(({ dimensions: existingDimensions }) => {
        return customDimensions.reduce((nextDimension, dimension, dimensionIdx) => {
          return nextDimension.then(() => {
            if (
              existingDimensions[dimensionIdx] &&
              shouldBeChanged(existingDimensions[dimensionIdx], dimension)
            ) {
              console.log('patch dimension');
              dimension.id = `ga:dimension${dimensionIdx + 1}`;
              dimension.index = dimensionIdx + 1;
              return patchDimensions({
                to: { oauth2Client, accountId, webPropertyId, customDimensionId: dimension.id },
                dimension
              }).then(({ dimension: newDimension }) => (dimension.id = newDimension.id));
            }
            if (!existingDimensions[dimensionIdx]) {
              console.log('insert dimension');
              dimension.id = `ga:dimension${dimensionIdx + 1}`;
              dimension.index = dimensionIdx + 1;
              return insertDimensions({
                to: { oauth2Client, accountId, webPropertyId },
                dimension
              }).then(({ dimension: newDimension }) => (dimension.id = newDimension.id));
            }
            return true;
          });
        }, Promise.resolve());
        //for each dimension, diff and patch/insert
      });
  }
  if (views.length > 0) {
    const hasUnique = views.reduce((r, { view }) => r || view.uniqueKey, false);
    const hasId = views.reduce((r, { view }) => r || !!view.id, false);
    if (hasUnique || hasId) {
      pipe = pipe.then(() => ({ from: { oauth2Client, accountId, webPropertyId } })).then(getViews);
    }
    pipe = views.reduce((next, { view, goals = [], filters = [] }) => {
      return next
        .then(({ views: existingViews = [] } = {}) => {
          //for each view, diff and patch/insert
          if (!view.id && view.uniqueKey) {
            const { view: foundView } = findViewByUniqueKey(view.uniqueKey, view)({
              views: existingViews
            });
            return; //TODO: if not found
          }
          if (!view.id && !view.uniqueKey) {
            console.log('insert view');
            return insertView({ to: { oauth2Client, accountId, webPropertyId }, view })
              .then(({ view: newView }) => (view.id = newView.id))
              .then(() => ({ views: existingViews }));
          }
          if (view.id) {
            //if view id
            const ids = existingViews.map((v) => v.id);
            if (!!~ids.indexOf(view.id)) {
              const foundExistingView = existingViews[ids.indexOf(view.id)];
              if (shouldBeChanged(foundExistingView, view)) {
                console.log('patch view');
                return patchView({
                  to: { oauth2Client, accountId, webPropertyId, profileId: view.id },
                  view
                }).then(() => ({ views: existingViews }));
              }
              return { views: existingViews };
            }
            //TODO: hasn't found
            return { views: existingViews };
          }
          return { views: existingViews };
        })
        .then(({ views: existingViews }) => {
          let goalsPipe = Promise.resolve([]);
          if (goals.length > 0) {
            goalsPipe = goalsPipe
              .then(() => ({
                from: { oauth2Client, accountId, webPropertyId, profileId: view.id }
              }))
              .then(getGoals);
          }

          return goals
            .reduce((nextGoal, goal, goalIdx) => {
              return nextGoal.then(({ goals: existingGoals }) => {
                if (existingGoals[goalIdx] && shouldBeChanged(existingGoals[goalIdx], goal)) {
                  console.log('patch goal');
                  goal.id = goalIdx + 1;
                  return patchGoal({
                    to: {
                      oauth2Client,
                      accountId,
                      webPropertyId,
                      profileId: view.id,
                      goalId: goal.id
                    },
                    goal
                  })
                    .then(({ goal: newGoal }) => (goal.id = newGoal.id))
                    .then(() => ({ goals: existingGoals }));
                }
                if (!existingGoals[goalIdx]) {
                  console.log('insert goal');
                  goal.id = goalIdx + 1;
                  return insertGoal({
                    to: { oauth2Client, accountId, webPropertyId, profileId: view.id },
                    goal
                  })
                    .then(({ goal: newGoal }) => (goal.id = newGoal.id))
                    .then(() => ({ goals: existingGoals }));
                }
                return { goals: existingGoals };
              });
            }, goalsPipe)
            .then(() => ({ views: existingViews }));
        })
        .then(({ views: existingViews }) => {
          //TODO: implement filters
          return { views: existingViews };
        });
    }, pipe);
  }
  return pipe;
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
  insertGoal: backOff(insertGoal),

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
