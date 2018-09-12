const { google } = require('googleapis');
var OAuth2 = google.auth.OAuth2;
const { getAccountSummaries, make } = require('./gaApi');
const { GoogleAnalyticsError, ServiceError } = require('./errors');

const token = {
  access_token:
    'ya29.Glv6BXJoVhqA6JaEmjKMlWrCgxALV4ASkIuMnfLnANMXa8Obp94ZdNmb_YxgP8NF9h-7EQD0q-ZAZZjU70IGrplYjolELganqTsLSYCy0oPfxEMXMHRvGGYL7DfG',
  id_token:
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImJhNGFlYWU4YjIwOGFkOWFlMTJiNjYxMDg2NWY2Mzk2MTI4N2I2ZDYifQ.eyJhenAiOiI5OTA0NjU1NTI1MzItMTBqMDkwM3FnYjJsbGcxYXFxMWwxNnZpYTZnNnZncWMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI5OTA0NjU1NTI1MzItMTBqMDkwM3FnYjJsbGcxYXFxMWwxNnZpYTZnNnZncWMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTE4ODI1ODk4Nzc1MjAyNjgzOTMiLCJlbWFpbCI6ImRqa29qYkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IklaWlJQOGIzNVFhZXZoajVUZlJfbUEiLCJleHAiOjE1MzQzNDc5NDIsImlzcyI6ImFjY291bnRzLmdvb2dsZS5jb20iLCJpYXQiOjE1MzQzNDQzNDJ9.m-vGwZnuQjbZhAhW7ldy1oMuowh3nDQEP7wUmU3aWaOxaSITkL8qMoygVya2iFaqfzUvFFkFkq13P6AnJ1Agjto-v3p5sF7hWjOe5TjvAMit9JnRm0NoESVNt5-gVZKM-hwWZTLAEAhWv9C1KE-70rg7EOOdFCYh4QM3b_BKE7FN6Akubu74eetuXZM0ZEeptBC8Wro7QBo_P3GHOEptXQ54gkktUeck-c75aW7ru00qDhy36qDygL1w0flFho_RcGbUHMRwC3yFhlosENGPGwFinE0xO3d8cK4d4AS1EBHlQJLd88orjsuMMy_UMSDhlzm5kxWWxENqNj2V4xe0kQ',
  refresh_token: '1/mz-to9v6s_lojmNzROuvEJPPjmwmBUt1c-1B7OFPUms',
  scope:
    'https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/analytics.edit https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/userinfo.email',
  token_type: 'Bearer',
  appAccId: 'app2',
  isEdit: true
};

let oauth2Client = new OAuth2(
  '990465552532-10j0903qgb2llg1aqq1l16via6g6vgqc.apps.googleusercontent.com',
  '9E366vGB3hT6bpycvSWU8Tb3'
);

oauth2Client.setCredentials(token);

const referenceObject = {
  accountId: 29500437,
  webProperty: {
    name: 'NewAcc',
    websiteUrl: 'http://someUrl.com',
    industryVertical: 'UNSPECIFIED'
  },
  customDimensions: [
    null,
    {
      name: 'Position2',
      scope: 'SESSION',
      active: true
    },
    {
      name: 'Date3',
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
  .catch((e) => console.log(e.toDebug()));
