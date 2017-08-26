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

superUser = userId

## Trends

place:{woeId}

- id: place:753692
- name: Barcelona
- country: Spain
- countryCode: ES
- type: Town
- updated: 2017-07-02T12:43:21Z

places := {placeId1, placeId2, placeId3, ...}

places:{userId} := {placeId1, placeId2, ...}

users:{placeId} := {userId1, userId2, ...}

trends:{placeId} := {(text1, count1), (text2, count2)}

trends:{placeId}:YYYYMMDDHHMM := {(text1, count1), (text2, count2)}

## Searches

searches:{user-id} := {searchId1, searchId2}

search:{search-id}
- q: obama
- created: 2017-07-02T12:44:22Z

search:{search-id}:users := {(user1, count1), (user2, count2)}

search:{search-id}:hashtags := {(tag1, count1), (tag2, count2)}

search:{search-id}:tweets
