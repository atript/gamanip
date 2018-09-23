const { google } = require('googleapis');
var OAuth2 = google.auth.OAuth2;
const { getAccountSummaries, make } = require('./gaApi');
const { GoogleAnalyticsError, ServiceError } = require('./errors');

const token = {
  access_token:
    'ya29.GlshBhLkwWtZUayhff4Xmu1j7eiZCDGJARPuJf-6ekjwb2pz1bhta4BM4Jf6WCTqM4w4bLjJGRcz1-2cgsWgsyZTAta-Y8Y-cjKgVkJCRoA3b1pStyy-t6uzdMdH',
  refresh_token: '1/e9scwGQgizAU__zRsf81hpLUQhP-zDANmFdPRS9lJkXBv54yS7x8K4ZzRaFwPKzi',
  scope:
    'https://www.googleapis.com/auth/analytics.edit https://www.googleapis.com/auth/tagmanager.readonly https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/tagmanager.edit.containers https://www.googleapis.com/auth/tagmanager.edit.containerversions https://www.googleapis.com/auth/tagmanager.publish https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/userinfo.email',
  token_type: 'Bearer',
  id_token:
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImEwN2VjN2JkYThjY2M0Mzg1NTY1NWI5ZjIyNDVhNGUyZGUyMGFlNWMifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI5OTA0NjU1NTI1MzItMTBqMDkwM3FnYjJsbGcxYXFxMWwxNnZpYTZnNnZncWMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI5OTA0NjU1NTI1MzItMTBqMDkwM3FnYjJsbGcxYXFxMWwxNnZpYTZnNnZncWMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTE4ODI1ODk4Nzc1MjAyNjgzOTMiLCJlbWFpbCI6ImRqa29qYkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IjZMR0d3djJXNDA0VjI0TzJIZUY4V0EiLCJpYXQiOjE1Mzc2OTEwNTIsImV4cCI6MTUzNzY5NDY1Mn0.fmb4li0dW36E_4WhyzntILi98L011kxYHLzHork8rk7aa5JYfB0n6ndENB024QHdFSXuWDeQhxuCovlu4Y6byqMz9xaJ9aZVVUJ_3s3dZkftqBNXkj5yBAJ-LiNlxXMEmE__6GeBqd5dkdB5R2TS9YUPSNKN71geGw7ZcEGmHNy2yP6Yo9OUl6FPgVt5CqcqfGGV7h4ZqRYo0FdH4gXtDarT7u9taJQHHO8Xs2hcA4mGLzc3b-GhhWXQcDhGIlQUdittf86fNiFM980BEkSvR5yOa0Q9ctGF7omTPsiVsK_GG2nxKseUR8uwpfCkmLb5Jq1a91C0hYlhD61BRN0keg',
  expiry_date: 1537694652886
};

let oauth2Client = new OAuth2(
  '990465552532-10j0903qgb2llg1aqq1l16via6g6vgqc.apps.googleusercontent.com',
  '9E366vGB3hT6bpycvSWU8Tb3'
);
/*let oauth2Client = new OAuth2(
  '103304962033-qac52hm7ibqm5jevgkdu3on4bea1871g.apps.googleusercontent.com',
  'zVNuy2cK5X27LjZ5S_HFzP_s'
);*/

oauth2Client.setCredentials(token);

const referenceObject = {
  accountId: 317979,
  webProperty: {
    name: 'NewAcc',
    websiteUrl: 'http://someUrl.com',
    industryVertical: 'UNSPECIFIED'
  },

  customDimensions: [
    {
      name: 'Position2',
      scope: 'SESSION',
      active: true
    },
    {
      name: 'Date3',
      scope: 'SESSION',
      active: true
    },
    {
      name: 'Date4',
      scope: 'SESSION',
      active: true
    },
    {
      name: 'Date5',
      scope: 'SESSION',
      active: true
    },
    {
      name: 'Date6',
      scope: 'SESSION',
      active: true
    }
  ],
  customMetrics: [],
  views: [
    {
      view: {
        name: 'New View 2',
        websiteUrl: 'http://tt.someUrl.com',
        type: 'WEB'
      },
      goals: [
        {
          active: true,
          name: 'ConAB',
          type: 'EVENT',
          eventDetails: {
            useEventValue: true,
            eventConditions: [
              {
                type: 'CATEGORY',
                matchType: 'EXACT',
                expression: 'Conversion'
              }
            ]
          }
        },
        {
          active: false,
          name: 'Convers',
          type: 'EVENT',
          eventDetails: {
            useEventValue: true,
            eventConditions: [
              {
                type: 'CATEGORY',
                matchType: 'EXACT',
                expression: 'Conversion'
              }
            ]
          }
        }
      ],
      filters: [
        {
          uniqueKey: 'name',
          name: 'My Domain Filter',
          type: 'EXCLUDE',
          excludeDetails: {
            field: 'GEO_DOMAIN',
            matchType: 'EQUAL',
            expressionValue: 'example.com',
            caseSensitive: false
          }
        }
      ]
    },
    {
      view: {
        name: 'Another View 1',
        websiteUrl: 'http://someUrl.com',
        type: 'WEB'
      },
      goals: [],
      filters: []
    }
  ]
};
/*
getAccountSummaries({from:{oauth2Client}})
  .then(a => console.log(a))
  .catch((err) => Promise.reject(new GoogleAnalyticsError(err)))
  .catch(e => console.log(e.toString()))
*/
make({ oauth2Client, referenceObject })
  //.catch((err) => Promise.reject(console.log(err) && err))
  .catch((err) => Promise.reject(new ServiceError(500, err)))
  .catch((e) => console.log(e.toDebug()))
  .then((r) => console.log(r));
