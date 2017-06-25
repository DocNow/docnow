# Redis Data Dictionary

## Users

user:{userId}

  - name: Ed Summers
  - twitterScreenName: edsu
  - twitterLocation: Silver Spring, MD
  - twitterUserId: 2143242
  - twitterAvatarUrl: http://example.com/image.jpg
  - twitterAccessToken: lksdjflksjf
  - twitterAccessTokenSecret: sldkfjlskjdf

twitter:{twitterUserId} = user:{userId}

## Trends

place:{woeId}

- id: 753692
- name: Barcelona
- country: Spain
- countryCode: ES
- type: Town
- updated: 2017-07-02T12:43:21Z

place:{userId} := (woeId1, woeId2, ...)

trendCount:{woeId} := ((text1, count1), (text2, count2))

trendCount:{woeId}:YYYYMMDDHHMM := ((text1, count1), (text2, count2))
