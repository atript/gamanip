## Modules

<dl>
<dt><a href="#module_gamanip">gamanip</a></dt>
<dd><p>A Promise based module for working with Google Analytics Management API.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#FromRoot">FromRoot</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#FromAccount">FromAccount</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#FromWebProperty">FromWebProperty</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#FromProfile">FromProfile</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="module_gamanip"></a>

## gamanip
A Promise based module for working with Google Analytics Management API.


* [gamanip](#module_gamanip)
    * [~MAX_TIMEOUT_COUNT](#module_gamanip..MAX_TIMEOUT_COUNT)
    * [~START_TIMEOUT_TIME](#module_gamanip..START_TIMEOUT_TIME)
    * [~backOff()](#module_gamanip..backOff) ⇒ <code>function</code>
    * [~getAccountSummaries(query)](#module_gamanip..getAccountSummaries) ⇒ <code>Promise</code>
    * [~getAccounts(query)](#module_gamanip..getAccounts) ⇒ <code>Promise</code>
    * [~getWebProperties(query)](#module_gamanip..getWebProperties) ⇒ <code>Promise</code>
    * [~getWebProperty(query)](#module_gamanip..getWebProperty) ⇒ <code>Promise</code>
    * [~insertWebProperty(query)](#module_gamanip..insertWebProperty) ⇒ <code>Promise</code>
    * [~patchWebProperty(query)](#module_gamanip..patchWebProperty) ⇒ <code>Promise</code>
    * [~getDimensions(query)](#module_gamanip..getDimensions) ⇒ <code>Promise</code>
    * [~insertDimensions(query)](#module_gamanip..insertDimensions) ⇒ <code>Promise</code>
    * [~patchDimensions(query)](#module_gamanip..patchDimensions) ⇒ <code>Promise</code>
    * [~getMetrics(query)](#module_gamanip..getMetrics) ⇒ <code>Promise</code>
    * [~insertMetrics(query)](#module_gamanip..insertMetrics) ⇒ <code>Promise</code>
    * [~patchMetrics(query)](#module_gamanip..patchMetrics) ⇒ <code>Promise</code>
    * [~getViews(query)](#module_gamanip..getViews) ⇒ <code>Promise</code>
    * [~getView(query)](#module_gamanip..getView) ⇒ <code>Promise</code>
    * [~insertView(query)](#module_gamanip..insertView) ⇒ <code>Promise</code>
    * [~patchView(query)](#module_gamanip..patchView) ⇒ <code>Promise</code>
    * [~getGoals(query)](#module_gamanip..getGoals) ⇒ <code>Promise</code>
    * [~insertGoal(query)](#module_gamanip..insertGoal) ⇒ <code>Promise</code>
    * [~patchGoal(query)](#module_gamanip..patchGoal) ⇒ <code>Promise</code>

<a name="module_gamanip..MAX_TIMEOUT_COUNT"></a>

### gamanip~MAX_TIMEOUT_COUNT
Number of retries for backOff function before throwing the error.

**Kind**: inner constant of [<code>gamanip</code>](#module_gamanip)  
<a name="module_gamanip..START_TIMEOUT_TIME"></a>

### gamanip~START_TIMEOUT_TIME
Starting delay in ms of exponential backoff. The pattern: 100,200,400,800...

**Kind**: inner constant of [<code>gamanip</code>](#module_gamanip)  
<a name="module_gamanip..backOff"></a>

### gamanip~backOff() ⇒ <code>function</code>
Exponential backoff wrapper for google API
Retries the function if error contains errors with one of following reasons 'rateLimitExceeded','quotaExceeded','userRateLimitExceeded','backendError'

**Kind**: inner method of [<code>gamanip</code>](#module_gamanip)  
**See**

- [MAX_TIMEOUT_COUNT](MAX_TIMEOUT_COUNT)
- [START_TIMEOUT_TIME](START_TIMEOUT_TIME)

<a name="module_gamanip..getAccountSummaries"></a>

### gamanip~getAccountSummaries(query) ⇒ <code>Promise</code>
Get account summaries.
Returns an array of summaries for accounts. (all accounts and properties). Do not return profiles.

**Kind**: inner method of [<code>gamanip</code>](#module_gamanip)  
**Fulfil**: <code>{ from: FromRoot, summary: Array.Object </code>} - pass down summaries along with the origin  

| Param | Type |
| --- | --- |
| query |  | 
| query.from | [<code>FromRoot</code>](#FromRoot) | 
| query.from.oauth2Client | <code>object</code> | 

<a name="module_gamanip..getAccounts"></a>

### gamanip~getAccounts(query) ⇒ <code>Promise</code>
Get accounts data.
Returns an array of accounts.

**Kind**: inner method of [<code>gamanip</code>](#module_gamanip)  
**Fulfil**: <code>{ from: FromRoot, accounts: Array.Object </code>} - pass down accounts along with the origin  

| Param | Type | Description |
| --- | --- | --- |
| query |  |  |
| query.from | [<code>FromRoot</code>](#FromRoot) |  |
| query.from.oauth2Client | <code>object</code> | authenticated client |

<a name="module_gamanip..getWebProperties"></a>

### gamanip~getWebProperties(query) ⇒ <code>Promise</code>
Get web properties data.
Returns an array of web properties.

**Kind**: inner method of [<code>gamanip</code>](#module_gamanip)  
**Fulfil**: <code>{ from: FromAccount, webProperties: Array.Object </code>} - pass down webProperties along with the origin  

| Param | Type | Description |
| --- | --- | --- |
| query |  |  |
| query.from | [<code>FromAccount</code>](#FromAccount) |  |
| query.from.oauth2Client | <code>object</code> | authenticated client |
| query.from.accountId | <code>string</code> | the id of account in GA |

<a name="module_gamanip..getWebProperty"></a>

### gamanip~getWebProperty(query) ⇒ <code>Promise</code>
Get web property data.
Returns an array of web properties.

**Kind**: inner method of [<code>gamanip</code>](#module_gamanip)  
**Fulfil**: <code>{ from: FromWebProperty, webProperty: Object </code>} - pass down webProperty along with the origin  

| Param | Type | Description |
| --- | --- | --- |
| query |  |  |
| query.from | [<code>FromWebProperty</code>](#FromWebProperty) |  |
| query.from.oauth2Client | <code>object</code> | authenticated client |
| query.from.accountId | <code>string</code> | the id of account in GA |
| query.from.webPropertyId | <code>string</code> | the id of web  in GA |

<a name="module_gamanip..insertWebProperty"></a>

### gamanip~insertWebProperty(query) ⇒ <code>Promise</code>
Get web property data.
Returns an array of web properties.

**Kind**: inner method of [<code>gamanip</code>](#module_gamanip)  
**Fulfil**: <code>{ from: FromWebProperty, webProperty: Object </code>} - pass down webProperty along with the origin  

| Param | Type | Description |
| --- | --- | --- |
| query |  |  |
| query.to | [<code>FromWebProperty</code>](#FromWebProperty) |  |
| query.to.oauth2Client | <code>object</code> | authenticated client |
| query.to.accountId | <code>string</code> | the id of account in GA |
| query.webProperty | <code>object</code> | the id of web  in GA |

<a name="module_gamanip..patchWebProperty"></a>

### gamanip~patchWebProperty(query) ⇒ <code>Promise</code>
Patch web property data.
Returns an array of web properties.

**Kind**: inner method of [<code>gamanip</code>](#module_gamanip)  
**Fulfil**: <code>{ from: FromWebProperty, webProperty: Object </code>} - pass down webProperty along with the origin  

| Param | Type | Description |
| --- | --- | --- |
| query |  |  |
| query.to | [<code>FromWebProperty</code>](#FromWebProperty) |  |
| query.to.oauth2Client | <code>object</code> | authenticated client |
| query.to.accountId | <code>string</code> | the id of account in GA |
| query.from.webPropertyId | <code>string</code> | the id of web  in GA |
| query.webProperty | <code>object</code> | the id of web  in GA |

<a name="module_gamanip..getDimensions"></a>

### gamanip~getDimensions(query) ⇒ <code>Promise</code>
Get dimensions data.
Returns an array of dimensions.

**Kind**: inner method of [<code>gamanip</code>](#module_gamanip)  
**Fulfil**: <code>{ from: FromWebProperty, webProperty: Object </code>} - pass down dimentsions along with the origin  

| Param | Type | Description |
| --- | --- | --- |
| query |  |  |
| query.from | [<code>FromWebProperty</code>](#FromWebProperty) |  |
| query.from.oauth2Client | <code>object</code> | authenticated client |
| query.from.accountId | <code>string</code> | the id of account in GA |
| query.from.webPropertyId | <code>string</code> | the id of web  in GA |

<a name="module_gamanip..insertDimensions"></a>

### gamanip~insertDimensions(query) ⇒ <code>Promise</code>
Insert dimension to a view.
Returns a created dimension.

**Kind**: inner method of [<code>gamanip</code>](#module_gamanip)  
**Fulfil**: <code>{ from: FromProfile, dimension: Object </code>} - pass down dimension along with the origin  

| Param | Type | Description |
| --- | --- | --- |
| query |  |  |
| query.from | [<code>FromProfile</code>](#FromProfile) |  |
| query.from.oauth2Client | <code>object</code> | authenticated client |
| query.from.accountId | <code>string</code> | the id of account in GA |
| query.from.webPropertyId | <code>string</code> | the id of webProperty in GA |
| query.dimension | <code>object</code> | the dimension |

<a name="module_gamanip..patchDimensions"></a>

### gamanip~patchDimensions(query) ⇒ <code>Promise</code>
Patch dimension to a view.
Returns a created dimension.

**Kind**: inner method of [<code>gamanip</code>](#module_gamanip)  
**Fulfil**: <code>{ from: FromProfile, dimension: Object </code>} - pass down dimension along with the origin  

| Param | Type | Description |
| --- | --- | --- |
| query |  |  |
| query.from | [<code>FromProfile</code>](#FromProfile) |  |
| query.from.oauth2Client | <code>object</code> | authenticated client |
| query.from.accountId | <code>string</code> | the id of account in GA |
| query.from.webPropertyId | <code>string</code> | the id of webProperty in GA |
| query.dimension | <code>object</code> | the dimension |

<a name="module_gamanip..getMetrics"></a>

### gamanip~getMetrics(query) ⇒ <code>Promise</code>
Get metrics data.
Returns an array of metrics.

**Kind**: inner method of [<code>gamanip</code>](#module_gamanip)  
**Fulfil**: <code>{ from: FromWebProperty, webProperty: Object </code>} - pass down metrics along with the origin  

| Param | Type | Description |
| --- | --- | --- |
| query |  |  |
| query.from | [<code>FromWebProperty</code>](#FromWebProperty) |  |
| query.from.oauth2Client | <code>object</code> | authenticated client |
| query.from.accountId | <code>string</code> | the id of account in GA |
| query.from.webPropertyId | <code>string</code> | the id of web  in GA |

<a name="module_gamanip..insertMetrics"></a>

### gamanip~insertMetrics(query) ⇒ <code>Promise</code>
Insert metric to a view.
Returns a created metric.

**Kind**: inner method of [<code>gamanip</code>](#module_gamanip)  
**Fulfil**: <code>{ from: FromProfile, metric: Object </code>} - pass down metric along with the origin  

| Param | Type | Description |
| --- | --- | --- |
| query |  |  |
| query.from | [<code>FromProfile</code>](#FromProfile) |  |
| query.from.oauth2Client | <code>object</code> | authenticated client |
| query.from.accountId | <code>string</code> | the id of account in GA |
| query.from.webPropertyId | <code>string</code> | the id of webProperty in GA |

<a name="module_gamanip..patchMetrics"></a>

### gamanip~patchMetrics(query) ⇒ <code>Promise</code>
Patch metric to a view.
Returns a created metric.

**Kind**: inner method of [<code>gamanip</code>](#module_gamanip)  
**Fulfil**: <code>{ from: FromProfile, metric: Object </code>} - pass down metric along with the origin  

| Param | Type | Description |
| --- | --- | --- |
| query |  |  |
| query.from | [<code>FromProfile</code>](#FromProfile) |  |
| query.from.oauth2Client | <code>object</code> | authenticated client |
| query.from.accountId | <code>string</code> | the id of account in GA |
| query.from.webPropertyId | <code>string</code> | the id of webProperty in GA |

<a name="module_gamanip..getViews"></a>

### gamanip~getViews(query) ⇒ <code>Promise</code>
Get views from web property.
Returns an array of views.

**Kind**: inner method of [<code>gamanip</code>](#module_gamanip)  
**Fulfil**: <code>{ from: FromWebProperty, views: Array.Object </code>} - pass down views along with the origin  

| Param | Type | Description |
| --- | --- | --- |
| query |  |  |
| query.from | [<code>FromWebProperty</code>](#FromWebProperty) |  |
| query.from.oauth2Client | <code>object</code> | authenticated client |
| query.from.accountId | <code>string</code> | the id of account in GA |
| query.from.webPropertyId | <code>string</code> | the id of web  in GA |

<a name="module_gamanip..getView"></a>

### gamanip~getView(query) ⇒ <code>Promise</code>
Get views from web property.
Returns an array of views.

**Kind**: inner method of [<code>gamanip</code>](#module_gamanip)  
**Fulfil**: <code>{ from: FromProfile, view: Object </code>} - pass down views along with the origin  

| Param | Type | Description |
| --- | --- | --- |
| query |  |  |
| query.from | [<code>FromProfile</code>](#FromProfile) |  |
| query.from.oauth2Client | <code>object</code> | authenticated client |
| query.from.accountId | <code>string</code> | the id of account in GA |
| query.from.webPropertyId | <code>string</code> | the id of webProperty in GA |
| query.from.profileId | <code>string</code> | the id of view in GA |

<a name="module_gamanip..insertView"></a>

### gamanip~insertView(query) ⇒ <code>Promise</code>
Insert view to web property.
Returns an array of views.

**Kind**: inner method of [<code>gamanip</code>](#module_gamanip)  
**Fulfil**: <code>{ from: FromProfile, view: Object </code>} - pass down views along with the origin  

| Param | Type | Description |
| --- | --- | --- |
| query |  |  |
| query.from | [<code>FromProfile</code>](#FromProfile) |  |
| query.from.oauth2Client | <code>object</code> | authenticated client |
| query.from.accountId | <code>string</code> | the id of account in GA |
| query.from.webPropertyId | <code>string</code> | the id of webProperty in GA |
| query.view | <code>object</code> | the view |

<a name="module_gamanip..patchView"></a>

### gamanip~patchView(query) ⇒ <code>Promise</code>
Patch view to web property.
Returns an array of views.

**Kind**: inner method of [<code>gamanip</code>](#module_gamanip)  
**Fulfil**: <code>{ from: FromProfile, view: Object </code>} - pass down views along with the origin  

| Param | Type | Description |
| --- | --- | --- |
| query |  |  |
| query.from | [<code>FromProfile</code>](#FromProfile) |  |
| query.from.oauth2Client | <code>object</code> | authenticated client |
| query.from.accountId | <code>string</code> | the id of account in GA |
| query.from.webPropertyId | <code>string</code> | the id of webProperty in GA |
| query.from.profileId | <code>string</code> | the id of profileId in GA |
| query.view | <code>object</code> | the view |

<a name="module_gamanip..getGoals"></a>

### gamanip~getGoals(query) ⇒ <code>Promise</code>
Get goals from view.
Returns an array of goals.

**Kind**: inner method of [<code>gamanip</code>](#module_gamanip)  
**Fulfil**: <code>{ from: FromProfile, view: Object </code>} - pass down views along with the origin  

| Param | Type | Description |
| --- | --- | --- |
| query |  |  |
| query.from | [<code>FromProfile</code>](#FromProfile) |  |
| query.from.oauth2Client | <code>object</code> | authenticated client |
| query.from.accountId | <code>string</code> | the id of account in GA |
| query.from.webPropertyId | <code>string</code> | the id of webProperty in GA |
| query.from.profileId | <code>string</code> | the id of view in GA |

<a name="module_gamanip..insertGoal"></a>

### gamanip~insertGoal(query) ⇒ <code>Promise</code>
Insert goal to a view.
Returns a created goal.

**Kind**: inner method of [<code>gamanip</code>](#module_gamanip)  
**Fulfil**: <code>{ from: FromProfile, goal: Object </code>} - pass down goal along with the origin  

| Param | Type | Description |
| --- | --- | --- |
| query |  |  |
| query.from | [<code>FromProfile</code>](#FromProfile) |  |
| query.from.oauth2Client | <code>object</code> | authenticated client |
| query.from.accountId | <code>string</code> | the id of account in GA |
| query.from.webPropertyId | <code>string</code> | the id of webProperty in GA |
| query.from.profileId | <code>string</code> | the id of view in GA |

<a name="module_gamanip..patchGoal"></a>

### gamanip~patchGoal(query) ⇒ <code>Promise</code>
Patch goal to a view.
Returns a created goal.

**Kind**: inner method of [<code>gamanip</code>](#module_gamanip)  
**Fulfil**: <code>{ from: FromProfile, goal: Object </code>} - pass down goal along with the origin  

| Param | Type | Description |
| --- | --- | --- |
| query |  |  |
| query.from | [<code>FromProfile</code>](#FromProfile) |  |
| query.from.oauth2Client | <code>object</code> | authenticated client |
| query.from.accountId | <code>string</code> | the id of account in GA |
| query.from.webPropertyId | <code>string</code> | the id of webProperty in GA |
| query.from.profileId | <code>string</code> | the id of view in GA |

<a name="FromRoot"></a>

## FromRoot : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| oauth2Client | <code>object</code> | oauth2Client |

<a name="FromAccount"></a>

## FromAccount : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| oauth2Client | <code>object</code> | oauth2Client |
| accountId | <code>string</code> | accountId |

<a name="FromWebProperty"></a>

## FromWebProperty : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| oauth2Client | <code>object</code> | oauth2Client authenticated client |
| accountId | <code>string</code> | accountId |
| webPropertyId | <code>string</code> | webPropertyId |

<a name="FromProfile"></a>

## FromProfile : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| oauth2Client | <code>object</code> | oauth2Client authenticated client |
| accountId | <code>string</code> | accountId |
| webPropertyId | <code>string</code> | webPropertyId |
| profileId | <code>string</code> | profileId |

