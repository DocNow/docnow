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

location:{woeId}:

- name: Barcelona, Spain
- geo:  38.627003,-90.199402

trends:{userId} := (woeId1, woeId2, ...)

trendCount:{woeId} := ((woeId, count1), (woeId2, count2))

trendCount:{woeId}:YYYYMMDDHHMM := ((woeId, count1), (woeId2, count2))
